/*
 * Copyright 2021-2026 Ruby Juric
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs, { promises as fsP } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ReadableStream } from "node:stream/web";
import cachedir from "cachedir";
import Progress from "progress";
import urljoin from "url-join";
import type { Repo } from "./config";
import { fileExists, getFileSha1 } from "./files";
import AdmZip from "adm-zip";
import type { Config } from "./config";
import pLimit from "p-limit";

const storedVersionPath = cachedir("gwen-web");

type DoneResult = {
  status: "done";
};
type DownloadedResult = {
  status: "downloaded";
  artifactPath: string;
  deps?: MavenArtifact[];
};
type ErrorResult = {
  status: "error";
  message: string;
};
type Result = DoneResult | DownloadedResult | ErrorResult;
type MavenArtifact = {
  groupId: string;
  artifactId: string;
  version: string;
  packaging: string;
  sha1?: string;
};

async function startDownload(
  mavenArtifact: MavenArtifact,
  mavenRepo: Repo,
  gwenArtifact: MavenArtifact,
): Promise<Result> {
  const { groupId, artifactId, version, packaging } = mavenArtifact;
  const artifactName = `${artifactId}-${version}`;

  try {
    const isGwenZip = mavenArtifact === gwenArtifact;
    const artifactFilename = `${artifactName}.${packaging}`;
    const downloadLocation = isGwenZip
      ? path.join(
          await fsP.mkdtemp(path.join(os.tmpdir(), `${artifactId}-`)),
          artifactFilename,
        )
      : path.join(
          storedVersionPath,
          `${gwenArtifact.artifactId}-${gwenArtifact.version}`,
          "lib",
          `${groupId}.${artifactFilename}`,
        );

    const downloadRes = await fetch(
      urljoin(
        mavenRepo.url,
        `/${groupId.replaceAll(".", "/")}/${artifactId}/${version}/${artifactFilename}`,
      ),
    );

    if (downloadRes.status === 404) {
      return {
        status: "error",
        message: `${artifactName} doesn't exist. Check your version and try again.`,
      };
    }

    if (!downloadRes.body) {
      return {
        status: "error",
        message: `An unknown error occured while downloading ${artifactName}.`,
      };
    }

    const progress = new Progress("[:bar] :percent :elapseds", {
      width: 28,
      head: ">",
      total: Number.parseInt(
        downloadRes.headers.get("content-length") ?? "",
        10,
      ),
    });

    const outputStream = fs.createWriteStream(downloadLocation);

    for await (const chunk of downloadRes.body as ReadableStream<Uint8Array>) {
      if (isGwenZip) {
        progress.tick(chunk.length);
      }
      outputStream.write(chunk);
    }

    outputStream.on("finish", () => {
      outputStream.close();
    });

    await fileExists(downloadLocation);
    const sha1 = await getFileSha1(downloadLocation);
    if (isGwenZip) {
      if (sha1 !== downloadRes.headers.get("x-checksum-sha1")) {
        const etagSum = (downloadRes.headers.get("etag") ?? "").match(
          /{SHA1{(.*)}}/,
        );
        if (etagSum && sha1 !== etagSum[1]) {
          return {
            status: "error",
            message: `Failed hash validation for ${artifactName}! Maybe there was an Internet connection issue. Trying again may resolve the problem.`,
          };
        }
      }
    } else if (sha1 !== mavenArtifact.sha1) {
      return {
        status: "error",
        message: `Failed hash validation for ${artifactName}! Hash mismatch detected. Try again or resolve dependency problem.`,
      };
    }

    return {
      status: "downloaded",
      artifactPath: downloadLocation,
    };
  } catch (e) {
    if (e instanceof TypeError) {
      return {
        status: "error",
        message: `Failed downloading ${artifactName}. Check your internet${
          mavenRepo.custom ? " or maven repo" : ""
        } connection and try again.`,
      };
    }
    return {
      status: "error",
      message: `An unknown error occured while downloading ${artifactName}.`,
    };
  }
}

async function extractZip(info: Result): Promise<Result> {
  if (info.status !== "downloaded") return info;

  try {
    const zip = new AdmZip(info.artifactPath);
    await zip.extractAllToAsync(storedVersionPath, false, true);

    return {
      status: "done",
    };
  } catch (_e) {
    return {
      status: "error",
      message: `Could not extract Gwen-Web to ${storedVersionPath}.`,
    };
  }
}

function handleError(result: Result, gwenArtifact: MavenArtifact): void {
  if (result.status === "error") {
    console.log(result.message);
    const pathToPackage = path.join(
      storedVersionPath,
      `${gwenArtifact.artifactId}-${gwenArtifact.version}`,
    );
    fs.rmSync(pathToPackage, { recursive: true, force: true });
    process.exit(1);
  }
}

export async function download(
  mavenArtifact: MavenArtifact,
  gwenArtifact: MavenArtifact,
  config: Config,
): Promise<void> {
  const mavenRepo = mavenArtifact.version.includes("SNAPSHOT")
    ? config.mavenSnapshotRepo
    : config.mavenRepo;

  const dlResult = await startDownload(mavenArtifact, mavenRepo, gwenArtifact);
  handleError(dlResult, gwenArtifact);

  if (mavenArtifact === gwenArtifact) {
    const extractResult = await extractZip(dlResult);
    handleError(extractResult, gwenArtifact);
  }
}

export async function downloadDeps(
  gwenArtifact: MavenArtifact,
  config: Config,
): Promise<void> {
  const dependenciesJson = path.join(
    storedVersionPath,
    `${gwenArtifact.artifactId}-${gwenArtifact.version}`,
    "DEPENDENCIES.json",
  );
  if (await fileExists(dependenciesJson)) {
    const jsonContent = fs.readFileSync(dependenciesJson, "utf-8");
    const deps = JSON.parse(jsonContent);
    if (deps.length > 0) {
      console.log(`Downloading dependencies...`);
      const progress = new Progress("[:bar] :percent :elapseds", {
        width: 28,
        head: ">",
        total: deps.length,
      });
      const limit = pLimit(10);
      const downloads = deps.map((depArtifact: MavenArtifact) =>
        limit(() =>
          download(depArtifact, gwenArtifact, config).then(() =>
            progress.tick(1),
          ),
        ),
      );
      await Promise.all(downloads);
    }
  }
}

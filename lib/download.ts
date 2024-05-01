/*
 * Copyright 2021-2024 Ruby Juric
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

import type { ReadableStream } from "node:stream/web";
import fs, { promises as fsP } from "fs";
import path from "path";
import os from "os";
import cachedir from "cachedir";
import decompress from "decompress";
import Progress from "progress";
import urljoin from "url-join";
import { fileExists, getFileSha1 } from "./files";

const storedVersionPath = cachedir("gwen-web");

type DoneResult = {
  status: "done";
};
type DownloadedResult = {
  status: "downloaded";
  zipPath: string;
};
type ErrorResult = {
  status: "error";
  message: string;
};
type Result = DoneResult | DownloadedResult | ErrorResult;

async function startDownload(
  version: string,
  mavenRepo: string,
): Promise<Result> {
  if (await fileExists(path.join(storedVersionPath, `gwen-web-${version}`))) {
    return {
      status: "done",
    };
  }

  console.log(`Downloading Gwen-Web v${version}...`);

  try {
    const downloadLocation = path.join(
      await fsP.mkdtemp(path.join(os.tmpdir(), "gwen-web-")),
      `gwen-web-${version}.zip`,
    );
    const downloadRes = await fetch(
      urljoin(
        mavenRepo,
        `/org/gweninterpreter/gwen-web/${version}/gwen-web-${version}.zip`,
      ),
    );

    if (downloadRes.status === 404) {
      return {
        status: "error",
        message: `Gwen-Web v${version} doesn't exist. Check your version in package.json and try again.`,
      };
    }

    if (!downloadRes.body) {
      return {
        status: "error",
        message: "An unknown error occured while downloading Gwen-Web.",
      };
    }

    const progress = new Progress("[:bar] :percent :elapseds", {
      width: 28,
      head: ">",
      total: parseInt(downloadRes.headers.get("content-length") ?? ""),
    });

    const outputStream = fs.createWriteStream(downloadLocation);

    for await (const chunk of downloadRes.body as ReadableStream<Uint8Array>) {
      progress.tick(chunk.length);
      outputStream.write(chunk);
    }

    console.log("Validating downloaded archive hash...");
    const sha1 = await getFileSha1(downloadLocation);
    if (sha1 !== downloadRes.headers.get("x-checksum-sha1")) {
      const etagSum = (downloadRes.headers.get("etag") ?? "").match(
        /{SHA1{(.*)}}/,
      );
      if (etagSum && sha1 !== etagSum[1]) {
        return {
          status: "error",
          message:
            "Failed hash validation! Maybe there was an Internet connection issue. Trying again may resolve the problem.",
        };
      }
    }

    return {
      status: "downloaded",
      zipPath: downloadLocation,
    };
  } catch (e) {
    if (e instanceof TypeError) {
      return {
        status: "error",
        message: `Failed downloading Gwen-Web v${version}. Check your internet connection and try again.`,
      };
    } else {
      return {
        status: "error",
        message: "An unknown error occured while downloading Gwen-Web.",
      };
    }
  }
}

async function extractZip(info: Result): Promise<Result> {
  if (info.status !== "downloaded") return info;
  console.log(`Extracting...`);

  try {
    await decompress(info.zipPath, storedVersionPath);

    return {
      status: "done",
    };
  } catch (e) {
    return {
      status: "error",
      message: `Could not extract Gwen-Web to ${storedVersionPath}.`,
    };
  }
}

function handleError(result: Result): void {
  if (result.status === "error") {
    console.log(result.message);
    process.exit(1);
  }
}

export default async function download(
  version: string,
  mavenRepo: string,
): Promise<void> {
  const dlResult = await startDownload(version, mavenRepo);
  handleError(dlResult);

  const extractResult = await extractZip(dlResult);
  handleError(extractResult);

  console.log(`Downloaded Gwen-Web v${version}`);
}

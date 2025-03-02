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

import semverMaxSatisfying from "semver/ranges/max-satisfying";
import urljoin from "url-join";
import { DOMParser } from "@xmldom/xmldom";
import { isNodeLike } from "@xmldom/is-dom-node";
import xpath from "xpath";
import type { Config } from "./config";

type VersionInfo = {
  latestVersion: string;
  versions: string[];
};

async function getVersionInfo(config: Config): Promise<VersionInfo> {
  try {
    const metaXmlRes = await fetch(
      urljoin(
        config.mavenRepo.url,
        "/org/gweninterpreter/gwen-web/maven-metadata.xml",
      ),
    );

    if (!metaXmlRes.ok) {
      throw new Error("Unable to fetch Gwen-Web version metadata.");
    }

    const metaXml = await metaXmlRes.text();
    // no-op onError handler to prevent console logging on bad input
    const metaDoc = new DOMParser({ onError() {} }).parseFromString(
      metaXml,
      "application/xml",
    );

    if (!isNodeLike(metaDoc)) {
      throw new Error("Unable to parse Gwen-Web version metadata.");
    }

    const latestVersion = xpath.select1(
      "string(/metadata/versioning/latest)",
      metaDoc,
    ) as string;

    const versionElements = xpath.select(
      "/metadata/versioning/versions/version",
      metaDoc,
    ) as Node[];

    if (!latestVersion || versionElements.length === 0) {
      throw new Error("Unable to parse Gwen-Web version metadata.");
    }

    const versions = versionElements
      .map((node) => node.firstChild?.nodeValue)
      .filter(Boolean) as string[];

    return {
      latestVersion,
      versions,
    };
  } catch (e) {
    throw new Error(
      `Failed to get Gwen-Web versions. Check your internet${
        config.mavenRepo.custom ? " or maven repo" : ""
      } connection and try again.`,
    );
  }
}

export default async function getDesiredVersion(
  config: Config,
): Promise<string> {
  const versionInfo = await getVersionInfo(config);
  const versionRange = config.version.endsWith("-SNAPSHOT")
    ? config.version
    : (process.env.GWEN_WEB_VERSION ?? config.version);

  if (versionRange === "latest") {
    console.log("No version specified, using latest");
    return versionInfo.latestVersion;
  } else if (versionRange.endsWith("-SNAPSHOT")) {
    return versionRange;
  } else {
    const resolvedVersion = semverMaxSatisfying(
      versionInfo.versions,
      versionRange,
    );
    if (resolvedVersion === null) {
      throw new Error("Failed to resolve specified Gwen-Web version.");
    }

    return resolvedVersion;
  }
}

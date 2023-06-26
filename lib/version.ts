/*
 * Copyright 2021-2023 Jacob Juric
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

import axios from "axios";
import urljoin from "url-join";
import { DOMParser } from "@xmldom/xmldom";
import xpath from "xpath";
import type { Config } from "./config";

async function getLatestVersion(config: Config): Promise<string> {
  try {
    const metaXml = (
      await axios.get(
        urljoin(
          config.mavenRepo,
          "/org/gweninterpreter/gwen-web/maven-metadata.xml"
        ),
        {
          responseType: "text",
        }
      )
    ).data;

    const metaDoc = new DOMParser().parseFromString(metaXml);
    const result = xpath.select1("string(//latest)", metaDoc);
    if (result) {
      return result as string;
    } else {
      throw new Error("Unable to find latest Gwen-Web version.");
    }
  } catch (e) {
    throw new Error(
      "Failed to get latest Gwen-Web version. Check your internet connection and try again."
    );
  }
}

export default async function getDesiredVersion(
  config: Config
): Promise<string> {
  if (config.version === "latest") {
    console.log("No version specified, using latest");
    return await getLatestVersion(config);
  } else {
    return config.version;
  }
}

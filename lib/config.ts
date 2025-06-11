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

import { promises as fs } from "fs";

export type Repo = {
  url: string;
  custom: boolean;
};

export interface Config {
  mavenRepo: Repo;
  mavenSnapshotRepo: Repo;
  version: string;
}

export async function getConfig(
  packageJsonPath = "./package.json",
): Promise<Config> {
  const packageJson = JSON.parse(
    (await fs.readFile(packageJsonPath)).toString(),
  );
  const userSettings = packageJson.gwenWeb ?? {};
  const defaultMavenRepo = "https://repo1.maven.org/maven2/";
  const defaultMavenSnapshotRepo =
    "https://central.sonatype.com/repository/maven-snapshots/";

  return {
    mavenRepo: {
      url: userSettings.mavenRepo ?? defaultMavenRepo,
      custom:
        !!userSettings.mavenRepo && userSettings.mavenRepo != defaultMavenRepo,
    },
    mavenSnapshotRepo: {
      url: userSettings.mavenSnapshotRepo ?? defaultMavenSnapshotRepo,
      custom:
        !!userSettings.mavenSnapshotRepo &&
        userSettings.mavenSnapshotRepo != defaultMavenSnapshotRepo,
    },
    version: userSettings.version ?? "latest",
  };
}

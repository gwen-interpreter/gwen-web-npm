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

import { getConfig } from "../lib/config";

describe("getConfig", () => {
  it("should read config values from package.json", async () => {
    const config = await getConfig("./test/fixtures/package.json");

    expect(config.version).toBe("2.0.0");
    expect(config.mavenRepo).toBe("testRepo");
    expect(config.mavenSnapshotRepo).toBe("testSnapshotRepo");
  });

  it("should pick the correct defaults when none are specified", async () => {
    const config = await getConfig("./test/fixtures/blank-package.json");

    expect(config.version).toBe("latest");
    expect(config.mavenRepo).toBe("https://repo1.maven.org/maven2/");
    expect(config.mavenSnapshotRepo).toBe(
      "https://s01.oss.sonatype.org/content/repositories/snapshots/",
    );
  });
});

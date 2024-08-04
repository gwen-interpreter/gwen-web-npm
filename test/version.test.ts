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

import { jest } from "@jest/globals";
import { promises as fs } from "fs";
import getDesiredVersion from "../lib/version";

const mockFetch = jest.spyOn(global, "fetch");
const metadataFixture = "./test/fixtures/maven-metadata.xml";

const config = {
  mavenRepo: "test repo",
  mavenSnapshotRepo: "test repo",
  version: "latest",
};

describe("getDesiredVersion", () => {
  const origEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();

    process.env = { ...origEnv };

    mockFetch.mockImplementation(
      async () => new Response((await fs.readFile(metadataFixture)).toString()),
    );
  });

  afterEach(() => {
    process.env = origEnv;
  });

  it("should return the version specified in package.json", async () => {
    await expect(
      getDesiredVersion({
        ...config,
        version: "2.0.0",
      }),
    ).resolves.toBe("2.0.0");
  });

  it("should return the SNAPSHOT version specified in package.json", async () => {
    await expect(
      getDesiredVersion({
        ...config,
        version: "2.0.0-1-SNAPSHOT",
      }),
    ).resolves.toBe("2.0.0-1-SNAPSHOT");
  });

  it("should return the latest version matching specified semver range", async () => {
    await expect(
      getDesiredVersion({
        ...config,
        version: "^2.0.0",
      }),
    ).resolves.toBe("2.52.0");
  });

  it("should return the version specified in environment variables", async () => {
    process.env.GWEN_WEB_VERSION = "2.10.0";

    await expect(
      getDesiredVersion({
        ...config,
        version: "2.0.0",
      }),
    ).resolves.toBe("2.10.0");
  });

  it("should return the latest version from the network", async () => {
    await expect(getDesiredVersion(config)).resolves.toBe("2.52.0");
  });

  it("should reject if the metadata is invalid", async () => {
    mockFetch.mockImplementationOnce(async () => new Response("bad response"));

    await expect(getDesiredVersion(config)).rejects.toThrow(
      "Failed to get Gwen-Web versions. Check your internet connection and try again.",
    );
  });

  it("should reject if the metadata could not be fetched", async () => {
    mockFetch.mockImplementationOnce(
      async () => new Response("not found", { status: 404 }),
    );

    await expect(getDesiredVersion(config)).rejects.toThrow(
      "Failed to get Gwen-Web versions. Check your internet connection and try again.",
    );
  });
});

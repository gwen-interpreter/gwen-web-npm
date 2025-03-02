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

const configDefaultRepo = {
  mavenRepo: { url: "test repo", custom: false },
  mavenSnapshotRepo: { url: "test repo", custom: false },
  version: "latest",
};

const configCustomRepo = {
  mavenRepo: { url: "test repo", custom: true },
  mavenSnapshotRepo: { url: "test repo", custom: true },
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

  it("should return the version specified in package.json (default repo)", async () => {
    await expect(
      getDesiredVersion({
        ...configDefaultRepo,
        version: "2.0.0",
      }),
    ).resolves.toBe("2.0.0");
  });

  it("should return the version specified in package.json (custom repo)", async () => {
    await expect(
      getDesiredVersion({
        ...configCustomRepo,
        version: "2.1.0",
      }),
    ).resolves.toBe("2.1.0");
  });

  it("should return the SNAPSHOT version specified in package.json (default repo)", async () => {
    await expect(
      getDesiredVersion({
        ...configDefaultRepo,
        version: "2.0.0-1-SNAPSHOT",
      }),
    ).resolves.toBe("2.0.0-1-SNAPSHOT");
  });

  it("should return the SNAPSHOT version specified in package.json (custom repo)", async () => {
    await expect(
      getDesiredVersion({
        ...configCustomRepo,
        version: "2.1.0-1-SNAPSHOT",
      }),
    ).resolves.toBe("2.1.0-1-SNAPSHOT");
  });

  it("should return the latest version matching specified semver range (default repo)", async () => {
    await expect(
      getDesiredVersion({
        ...configDefaultRepo,
        version: "^2.0.0",
      }),
    ).resolves.toBe("2.52.0");
  });

  it("should return the latest version matching specified semver range (custom repo)", async () => {
    await expect(
      getDesiredVersion({
        ...configCustomRepo,
        version: "^3.0.0",
      }),
    ).resolves.toBe("3.77.3");
  });

  it("should return the version specified in environment variables (default repo)", async () => {
    process.env.GWEN_WEB_VERSION = "2.10.0";

    await expect(
      getDesiredVersion({
        ...configDefaultRepo,
        version: "2.0.0",
      }),
    ).resolves.toBe("2.10.0");
  });

  it("should return the version specified in environment variables  (custom repo)", async () => {
    process.env.GWEN_WEB_VERSION = "4.2.7";

    await expect(
      getDesiredVersion({
        ...configCustomRepo,
        version: "4.2.7",
      }),
    ).resolves.toBe("4.2.7");
  });

  it("should ignore the version specified in environment variables when using a SNAPSHOT (default repo)", async () => {
    process.env.GWEN_WEB_VERSION = "2.10.0";

    await expect(
      getDesiredVersion({
        ...configDefaultRepo,
        version: "2.0.0-1-SNAPSHOT",
      }),
    ).resolves.toBe("2.0.0-1-SNAPSHOT");
  });

  it("should ignore the version specified in environment variables when using a SNAPSHOT (custom repo)", async () => {
    process.env.GWEN_WEB_VERSION = "4.2.7";

    await expect(
      getDesiredVersion({
        ...configCustomRepo,
        version: "4.2.7-1-SNAPSHOT",
      }),
    ).resolves.toBe("4.2.7-1-SNAPSHOT");
  });

  it("should return the latest version from the network (default repo)", async () => {
    await expect(getDesiredVersion(configDefaultRepo)).resolves.toBe("2.52.0");
  });

  it("should return the latest version from the network (custom repo)", async () => {
    await expect(getDesiredVersion(configCustomRepo)).resolves.toBe("2.52.0");
  });

  it("should reject if the metadata is invalid (default repo)", async () => {
    mockFetch.mockImplementationOnce(async () => new Response("bad response"));

    await expect(getDesiredVersion(configDefaultRepo)).rejects.toThrow(
      "Failed to get Gwen-Web versions. Check your internet connection and try again.",
    );
  });

  it("should reject if the metadata is invalid (custom repo)", async () => {
    mockFetch.mockImplementationOnce(async () => new Response("bad response"));

    await expect(getDesiredVersion(configCustomRepo)).rejects.toThrow(
      "Failed to get Gwen-Web versions. Check your internet or maven repo connection and try again.",
    );
  });

  it("should reject if the metadata could not be fetched (default repo)", async () => {
    mockFetch.mockImplementationOnce(
      async () => new Response("not found", { status: 404 }),
    );

    await expect(getDesiredVersion(configDefaultRepo)).rejects.toThrow(
      "Failed to get Gwen-Web versions. Check your internet connection and try again.",
    );
  });

  it("should reject if the metadata could not be fetched (custom repo)", async () => {
    mockFetch.mockImplementationOnce(
      async () => new Response("not found", { status: 404 }),
    );

    await expect(getDesiredVersion(configCustomRepo)).rejects.toThrow(
      "Failed to get Gwen-Web versions. Check your internet or maven repo connection and try again.",
    );
  });
});

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

import { jest } from "@jest/globals";
import { promises as fs } from "fs";
import _axios from "axios";
import getDesiredVersion from "../lib/version";

const axios = jest.mocked(_axios);
const metadataFixture = "./test/fixtures/maven-metadata.xml";

const config = {
  mavenRepo: "test repo",
  mavenSnapshotRepo: "test repo",
  version: "latest",
};

describe("getDesiredVersion", () => {
  it("should return the version specified", async () => {
    await expect(
      getDesiredVersion({
        ...config,
        version: "2.0.0",
      }),
    ).resolves.toBe("2.0.0");
  });

  it("should return the latest version from the network", async () => {
    axios.get.mockResolvedValueOnce({
      data: (await fs.readFile(metadataFixture)).toString(),
    });

    await expect(getDesiredVersion(config)).resolves.toBe("2.52.0");
  });

  it("should reject if the metadata is invalid", async () => {
    axios.get.mockResolvedValueOnce({
      data: "bad response",
    });

    await expect(getDesiredVersion(config)).rejects.toThrow(
      "Failed to get latest Gwen-Web version. Check your internet connection and try again.",
    );
  });

  it("should reject if the metadata could not be fetched", async () => {
    axios.get.mockRejectedValueOnce({
      response: {
        status: 404,
      },
    });

    await expect(getDesiredVersion(config)).rejects.toThrow(
      "Failed to get latest Gwen-Web version. Check your internet connection and try again.",
    );
  });
});

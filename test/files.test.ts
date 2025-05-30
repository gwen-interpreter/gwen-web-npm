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

import { getFileSha1, fileExists } from "../lib/files";

const testFile = "./test/fixtures/maven-metadata.xml";

describe("getFileSha1", () => {
  it("should return the correct SHA1 hash for files", async () => {
    await expect(getFileSha1(testFile)).resolves.toBe(
      "f9abbe687aab74b9cc130ace1ee07cc81a8c4db5",
    );
  });

  it("should reject if the file cannot be read", async () => {
    await expect(getFileSha1("bad path")).rejects.toThrow(
      "Could not get hash of file bad path",
    );
  });
});

describe("fileExists", () => {
  it("should return true when a file exists", async () => {
    await expect(fileExists(testFile)).resolves.toBe(true);
  });

  it("should return false when a file does not exist", async () => {
    await expect(fileExists("bad path")).resolves.toBe(false);
  });
});

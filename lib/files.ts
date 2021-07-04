/*
 * Copyright 2021 Jacob Juric
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

import crypto from "crypto";
import fs from "fs";
import fsP from "fs/promises";

export async function getFileSha1(path: string): Promise<string> {
  const stream = fs.createReadStream(path);
  const hash = crypto.createHash("sha1");
  const chunks: Buffer[] = [];

  stream.pipe(hash);

  return new Promise((resolve, reject) => {
    function throwError(): void {
      reject(new Error(`Could not get hash of file ${path}`));
    }
    hash.on("data", (d) => chunks.push(Buffer.from(d)));
    hash.on("end", () => resolve(Buffer.concat(chunks).toString("hex")));
    hash.on("error", throwError);
    stream.on("error", throwError);
  });
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fsP.access(path, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

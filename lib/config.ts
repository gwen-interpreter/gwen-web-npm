import { promises as fs } from "fs";

export interface Config {
  mavenRepo: string;
  mavenSnapshotRepo: string;
  version: string;
}

export async function getConfig(
  packageJsonPath = "./package.json"
): Promise<Config> {
  const packageJson = JSON.parse(
    (await fs.readFile(packageJsonPath)).toString()
  );
  const userSettings = packageJson.gwenWeb ?? {};

  return {
    mavenRepo: userSettings.mavenRepo ?? "https://repo1.maven.org/maven2/",
    mavenSnapshotRepo:
      userSettings.mavenSnapshotRepo ??
      "https://s01.oss.sonatype.org/content/repositories/snapshots/",
    version: userSettings.version ?? "latest",
  };
}

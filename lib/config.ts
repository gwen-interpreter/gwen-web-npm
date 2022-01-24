import fs from "fs/promises";

export interface Config {
  mavenRepo: string;
  version: string;
}

function getDefaultRepo(version = "") {
  if (version.includes("SNAPSHOT")) {
    return "https://oss.sonatype.org/content/repositories/snapshots/";
  } else {
    return "https://repo1.maven.org/maven2/";
  }
}

export async function getConfig(
  packageJsonPath = "./package.json"
): Promise<Config> {
  const packageJson = JSON.parse(
    (await fs.readFile(packageJsonPath)).toString()
  );
  const userSettings = packageJson.gwenWeb ?? {};

  return {
    mavenRepo: userSettings.mavenRepo ?? getDefaultRepo(userSettings.version),
    version: userSettings.version ?? "latest",
  };
}

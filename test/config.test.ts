import { getConfig } from "../lib/config";

describe("getConfig", () => {
  it("should read config values from package.json", async () => {
    const config = await getConfig("./test/fixtures/package.json");

    expect(config.version).toBe("2.0.0");
    expect(config.mavenRepo).toBe("testRepo");
  });

  it("should pick the correct defaults when none are specified", async () => {
    const config = await getConfig("./test/fixtures/blank-package.json");

    expect(config.version).toBe("latest");
    expect(config.mavenRepo).toBe("https://repo1.maven.org/maven2/");
  });

  it("should pick the snapshot repo if the version is a snapshot", async () => {
    const config = await getConfig("./test/fixtures/snapshot-package.json");

    expect(config.version).toBe("2.0.0-SNAPSHOT");
    expect(config.mavenRepo).toBe(
      "https://oss.sonatype.org/content/repositories/snapshots/"
    );
  });
});

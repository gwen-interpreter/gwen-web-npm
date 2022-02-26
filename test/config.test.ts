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
      "https://s01.oss.sonatype.org/content/repositories/snapshots/"
    );
  });
});

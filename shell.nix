let
  nixpkgs = builtins.fetchTarball "https://github.com/NixOS/nixpkgs/archive/1ef586712f85b4b004caecd385d6b023e7fd2450.tar.gz";

  defaultPkgs = import nixpkgs {
    config = { };
    overlays = [ ];
  };
in

{
  pkgs ? defaultPkgs,
}:

pkgs.mkShell {
  name = "gwen-web-npm-devshell";
  packages = with pkgs; [
    biome
    nodejs
    pnpm
    typescript-language-server
  ];

  env = {
    BIOME_BINARY = pkgs.lib.getExe pkgs.biome;
  };
}

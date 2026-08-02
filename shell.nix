let
  nixpkgs = builtins.fetchTarball "https://github.com/NixOS/nixpkgs/archive/148bab9c1c3c53136ecb44a6ea356a0ed5b39b06.tar.gz";

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

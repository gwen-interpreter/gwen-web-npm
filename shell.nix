let
  nixpkgs = builtins.fetchTarball "https://github.com/NixOS/nixpkgs/archive/f72be405a10668b8b00937b452f2145244103ebc.tar.gz";

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

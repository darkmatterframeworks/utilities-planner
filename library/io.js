import fs from "fs";
import path from "path";
import R from "ramda";

// readFile :: String → Promise String
export const readFile = (sourcePath) =>
  new Promise(
    (resolve, reject) =>
      fs.readFile(
        sourcePath,
        'utf8',
        (error, result) => (error) ? reject(error) : resolve(result)
      )
  );

// writeFile :: String → String → Promise
export const writeFile = R.curry(
  (destinationPath, data) =>
    new Promise(
      (resolve, reject) =>
        fs.writeFile(
          destinationPath,
          data,
          'utf8',
          (error) => (error) ? reject(error) : resolve()
        )
    )
);
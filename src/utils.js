/*
 * @Author: Aardpro
 * @Date: 2021-05-29 09:40:48
 * @LastEditors: Aardpro
 * @LastEditTime: 2021-05-29 09:43:57
 * @Description: 压缩，file2base64，base642file
 */

import Compressor from "./compressor.esm"

export function compressorPromise(imageFile, options = { quality: 0.75 }) {
  return new Promise((resolve) => {
    new Compressor(imageFile, {
      ...options,
      success(result) {
        resolve(result)
      },
      error(err) {
        console.error(err.message);
        resolve(false)
      },
    });
  });
}

//把文件转为base64
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  })
}

//把base64转为file对象
export function base64ToFile(url, filename, mimeType) {
  return new Promise((resolve) => {
    fetch(url)
      .then(function (res) {
        return res.arrayBuffer();
      })
      .then(function (buf) {
        resolve(new File([buf], filename, { type: mimeType }));
      });
  });
}
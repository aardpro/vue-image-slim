<!--
 * @Author: Aardduke
 * @Date: 2021-03-19 21:48:29
 * @LastEditors: Aardpro
 * @LastEditTime: 2021-05-29 10:58:18
 * @Description: vue file
 2021-3-27:因为在element-dialog中，button会触发dialog关闭，改为div
-->
<template>
  <div style="display: inline-block">
    <input
      v-if="hasInput"
      type="file"
      :id="inputId"
      style="display: none"
      accept=".jpg,.jpeg,.png"
      @change="onSelectFile()"
    />
    <div
      @click="doClick"
      class="vue-image-slim-button"
      :class="{ disabled }"
      :style="{ width: btnWidth, height: btnHeight }"
    ></div>
    <div style="display: none">
      <img :id="imgId" />
      <canvas :id="cvsId"></canvas>
    </div>
  </div>
</template>

<script>
import { compressorPromise, fileToBase64, base64ToFile } from "./utils";
const id = new Date().valueOf();
let input, image, canvas, ctx;

export default /*#__PURE__*/ {
  name: "VueImageSlim", // vue component name
  props: {
    w: {
      //输出图片的宽度
      type: Number,
      default: 0, //缺省宽度,原图宽度
    },
    h: {
      //输出图片的高度
      type: Number,
      default: 0, //缺省高度，原图高度
    },
    o: {
      //剪切原点
      type: String,
      default: "C", // LT左上角/RT右上角/LB左下角/RB右下角/C中心点
    },
    disabled: {
      //是否禁止点击
      type: Boolean,
      default: false,
    },
    btnWidth: {
      //按钮宽度
      type: String,
      default: "100px",
    },
    btnHeight: {
      //按钮高度
      type: String,
      default: "100px",
    },
    compressRate: {
      //压缩比率
      type: Number,
      default: 0.75,
    },
  },
  data() {
    return { file: null, imageWidth: 0, imageHeight: 0, hasInput: true };
  },
  computed: {
    inputId: () => "input" + id,
    imgId: () => "btn" + id,
    cvsId: () => "cvs" + id,
  },
  mounted() {
    let dataURL, blob;
    image = document.getElementById(this.imgId);
    image.onload = async () => {
      if (!this.file) {
        return;
      }
      //如果不提供图片宽度和高度，即保持原有图片尺寸，那么调用compressor进行压缩
      if (this.h <= 0 && this.w <= 0) {
        blob = await compressorPromise(this.file);
        if (blob) {
          this.$emit("getFile", blob);
          dataURL = await fileToBase64(blob);
          if (dataURL) {
            this.$emit("getDataURL", dataURL);
          }
        }
        return;
      }
      // 清除cavas内容
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      canvas = document.getElementById(this.cvsId);
      if (!canvas) {
        return;
      }
      const pst = this.positions();
      if (pst === false) {
        return;
      }
      canvas.width = pst[6];
      canvas.height = pst[7];
      ctx = canvas.getContext("2d");
      ctx.drawImage(image, ...pst);
      dataURL = canvas.toDataURL(this.file.type, this.compressRate);
      this.$emit("getDataURL", dataURL);
      blob = await base64ToFile(dataURL, this.file.name, this.file.type);
      this.$emit("getFile", blob);
    };
  },
  methods: {
    doClick() {
      input = document.getElementById(this.inputId);
      if (!input || this.disabled) {
        return;
      }
      input.click();
    },
    async onSelectFile() {
      if (input.files instanceof FileList && input.files.length > 0) {
        this.file = input.files[0];
        //重置input，以便能够继续选择同一个文件
        this.hasInput = false;
        this.$nextTick(() => {
          this.hasInput = true;
        });
        var reader = new FileReader();
        reader.addEventListener(
          "load",
          function () {
            image.src = reader.result;
            reader = null;
          },
          false
        );
        reader.readAsDataURL(this.file);
      }
    },
    // 根据参数计算建材参数
    positions() {
      if (!image || !image.width || !image.height) {
        return false;
      }
      const sw = image.width,
        sh = image.height;
      if (
        isNaN(+this.w) ||
        +this.w < 1 ||
        isNaN(+this.h) ||
        +this.h < 1 ||
        this.w >= sw ||
        this.h >= sh
      ) {
        return [0, 0, sw, sh, 0, 0, sw, sh];
      }
      let x = 0,
        y = 0;
      let r = Math.min(sw / this.w, sh / this.h); //取较小比率作为图形比率
      let w = this.w * r;
      let h = this.h * r;
      // 根据原点计算剪切值，缺省是LT
      switch (this.o) {
        case "C": //中心对齐
          x = (sw - w) / 2;
          y = (sh - h) / 2;
          break;
        case "RT": //右上角对齐
          x = sw - w;
          y = 0;
          break;
        case "LB":
          x = 0;
          y = sh - h;
          break;
        case "RB":
          x = sw - w;
          y = sh - h;
          break;
      }
      return [x, y, w, h, 0, 0, this.w, this.h];
    },
  },
};
</script>
<style scope>
.vue-image-slim-button {
  position: relative;
  border: 1px solid #eee;
  background: transparent !important;
  display: inline-block;
  cursor: pointer;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.vue-image-slim-button:before,
.vue-image-slim-button:after {
  content: "";
  position: absolute;
  background: #ccc;
}

.vue-image-slim-button:before {
  left: calc(50% - 1px);
  top: 5%;
  height: 90%;
  width: 3px;
}

.vue-image-slim-button:after {
  top: calc(50% - 1px);
  left: 5%;
  height: 3px;
  width: 90%;
}
.vue-image-slim-button.disabled {
  cursor: not-allowed;
}
</style>

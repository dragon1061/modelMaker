# 阀门参数化生成 2D/3D 预览 Demo

技术栈：Vue 3 + TypeScript + Canvas（2D）+ Three.js（3D）

## 运行

> **注意**：本项目使用 Vite 8，需要 Node.js >= 20.19 或 >= 22.12。
> 如果你使用 nvm，推荐切换到 v23.x：
>
> ```bash
> nvm use 23
> ```

```bash
# 安装依赖（首次）
npm install

# 启动开发服务器（热更新）
npm run dev
# 默认地址：http://localhost:5173

# 构建生产包
npm run build

# 预览生产包
npm run preview
```

### 重启开发服务器

如果修改了样式或组件后页面未刷新，可手动重启：

```bash
# 停止当前进程（Ctrl+C），然后重新启动
npm run dev

# 或者指定端口
npm run dev -- --port 5173
```

## 功能

- 输入参数：口径 Dn、高度 H、法兰直径 Df、厚度 t
- 点击「生成」
- 左侧显示 2D 工程图（Canvas）
- 右侧显示 3D 模型（Three.js + OrbitControls，可旋转/缩放）

## 代码入口

- UI：`src/components/ValveDemo.vue`
- 2D：`src/components/Valve2DCanvas.vue` + `src/core/draw2d/*`
- 3D：`src/components/Valve3DViewer.vue` + `src/core/three/*`
- 参数校验：`src/core/validate.ts`
- 参数 -> 几何中间层：`src/core/buildModel.ts`


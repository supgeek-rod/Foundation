# syntax=docker/dockerfile:1

# ---------- 构建阶段 ----------
# 固定在运行器的原生架构（$BUILDPLATFORM）上构建：产物是纯静态文件，
# 无需为 arm64 走 QEMU 模拟，可大幅加快多架构镜像的构建速度
FROM --platform=$BUILDPLATFORM node:24-alpine AS builder

WORKDIR /app

# 先只复制依赖清单并安装，充分利用 Docker 层缓存
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- 运行阶段 ----------
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/ || exit 1

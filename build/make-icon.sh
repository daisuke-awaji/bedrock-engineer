#!/bin/bash

#
# Electron用にアプリアイコンを一括作成
# https://blog.katsubemakito.net/nodejs/electron/app-icon
#
# 実行方法
#   $ ./makeIcon.sh icon.png
#

#--------------------------------#
# 定数
#--------------------------------#
#-- 元画像 (512x512px) --#
readonly ORG_FILE=$1;

#-- Windows用アイコンの生成先 --#
readonly ICON_DIR_WIN='./'

#-- macOS用アイコン --#
readonly ICONSET_DIR='icon.iconset'
readonly ICON_DIR_MAC='./'

#--------------------------------#
# macOS用
#--------------------------------#
mkdir -p $ICONSET_DIR

#-- 元画像をリサイズしてコピー --#
convert -resize 16x16!    $ORG_FILE  $ICONSET_DIR/icon_16x16.png
convert -resize 32x32!    $ORG_FILE  $ICONSET_DIR/icon_16x16@2x.png
convert -resize 32x32!    $ORG_FILE  $ICONSET_DIR/icon_32x32.png
convert -resize 64x64!    $ORG_FILE  $ICONSET_DIR/icon_32x32@2x.png
convert -resize 128x128!  $ORG_FILE  $ICONSET_DIR/icon_128x128.png
convert -resize 256x256!  $ORG_FILE  $ICONSET_DIR/icon_128x128@2x.png
convert -resize 256x256!  $ORG_FILE  $ICONSET_DIR/icon_256x256.png
convert -resize 512x512!  $ORG_FILE  $ICONSET_DIR/icon_256x256@2x.png
convert -resize 512x512!  $ORG_FILE  $ICONSET_DIR/icon_512x512.png

#-- icns形式のファイルに変換 --$
iconutil -c icns $ICONSET_DIR -o $ICON_DIR_MAC/icon.icns

#---------------------------------------
# Windows用
#---------------------------------------
convert $ORG_FILE -define icon:auto-resize $ICON_DIR_WIN/icon.ico

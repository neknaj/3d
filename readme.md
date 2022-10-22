# 3D Draw
bem130が2022年の3月から7月ごろにかけて作っていた3D描画のプログラムを改良しつつ、  
使いやすいようにclassにしてまとめたものです。  

## オブジェクト
オブジェクトは、三角形の面の配列で表される  
```js
polygon = [[x,y,z],[x,y,z],[x,y,z],[r,g,b]];
// polygon = [一つ目の頂点,二つ目の頂点,三つ目の頂点, 面の色]
```
```js
object = [polygon,polygon,polygon,...];
// object = [一つ目の面,二つ目の面,三つ目の面,...]
```

## カメラ
カメラは、座標・向き・解像度で表される  
今後、視野の広さも追加予定  
### 座標
```js
pos = [x,y,z];
// pos = [x座標,y座標,z座標]
```
### 向き
```js
angle = [h,v];
// angle = [水平方向,垂直方向]
```
### 解像度
```js
display = [x,y];
// display = [横の解像度,縦の解像度]
```
### カメラ
```js
camera = [pos,angle,display];
// camera = [座標,向き,解像度]
```

## インターフェイス
### 初期化
classを初期化する  
```js
let tddraw = new tdDRAW();
```
### オブジェクトの設定
オブジェクトを設定する  
```js
tddraw.setObj(object);
```
### カメラを設定
カメラを設定する  
```js
tddraw.setCamera(camera);
```
### 画像を出力する
画像を出力する  
返り値はImageData  
```js
image = tddraw.getImg();
```
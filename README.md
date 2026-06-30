# Maqueen v4/v5 Compat

Maqueen v4 向けの基本的な MakeCode API を、Maqueen v4 と Maqueen v5 の両方で使いやすくするための micro:bit MakeCode 互換拡張機能です。

この拡張機能は、公式 Maqueen 拡張とは別の `maqueenCompat` 名前空間を使います。公式 Maqueen 拡張を同じプロジェクトへ追加しても、TypeScript 上の `maqueen` 名前空間とは衝突しません。

## 使い方

MakeCode の「拡張機能」で、この GitHub リポジトリの URL を指定して追加します。

```text
https://github.com/Poseidon1024/pxt-maqueen
```

プログラムの最初で Maqueen を準備します。

```blocks
maqueenCompat.init(maqueenCompat.BoardVersion.Auto)
```

通常は `Auto` で動作します。Maqueen v5 のラインセンサー値が変わらない場合は、ボード種別を明示してください。

```blocks
maqueenCompat.init(maqueenCompat.BoardVersion.V5)
```

## ラインセンサー

`maqueenCompat.readPatrol(...)` は、Maqueen v4 と Maqueen v5 のどちらでも v4 と同じ値にそろえて返します。

* `0`: 黒
* `1`: 白

Maqueen v5 では、左センサーと右センサーを v4 の左右センサーとして扱います。中央センサーはこの互換 API では使いません。

## 主な API

```blocks
maqueenCompat.init(maqueenCompat.BoardVersion.Auto)
maqueenCompat.motorRun(maqueenCompat.Motors.All, maqueenCompat.Dir.CW, 80)
maqueenCompat.motorStop(maqueenCompat.Motors.All)
maqueenCompat.readPatrol(maqueenCompat.Patrol.PatrolLeft)
maqueenCompat.Ultrasonic()
maqueenCompat.servoRun(maqueenCompat.Servos.S1, 90)
maqueenCompat.writeLED(maqueenCompat.LED.LEDLeft, maqueenCompat.LEDswitch.turnOn)
```

## 例

```blocks
maqueenCompat.init(maqueenCompat.BoardVersion.Auto)

basic.forever(function () {
    let left = maqueenCompat.readPatrol(maqueenCompat.Patrol.PatrolLeft)
    let right = maqueenCompat.readPatrol(maqueenCompat.Patrol.PatrolRight)

    if (left == 0 && right == 0) {
        maqueenCompat.motorRun(maqueenCompat.Motors.All, maqueenCompat.Dir.CW, 80)
    } else if (left == 0) {
        maqueenCompat.motorRun(maqueenCompat.Motors.M1, maqueenCompat.Dir.CW, 30)
        maqueenCompat.motorRun(maqueenCompat.Motors.M2, maqueenCompat.Dir.CW, 90)
    } else if (right == 0) {
        maqueenCompat.motorRun(maqueenCompat.Motors.M1, maqueenCompat.Dir.CW, 90)
        maqueenCompat.motorRun(maqueenCompat.Motors.M2, maqueenCompat.Dir.CW, 30)
    } else {
        maqueenCompat.motorStop(maqueenCompat.Motors.All)
    }
})
```

## 対応範囲

この拡張機能は、Maqueen v4 の基本 API を Maqueen v5 でも使うための互換レイヤーです。モーター、ラインセンサー、超音波センサー、サーボ、LED ON/OFF などの v4 基本機能を対象にしています。Maqueen v5 固有の RGB 色指定、中央ラインセンサー、自動巡回、BLE などの機能をすべて提供するものではありません。

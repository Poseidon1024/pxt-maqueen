maqueenCompat.init(maqueenCompat.BoardVersion.Auto)

basic.forever(function () {
    let left = maqueenCompat.readPatrol(maqueenCompat.Patrol.PatrolLeft)
    let right = maqueenCompat.readPatrol(maqueenCompat.Patrol.PatrolRight)

    serial.writeLine("L:" + left + " R:" + right)

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

    basic.pause(20)
})

interface MaqueenCompatLineEvent {
    key: number;
    action: Action;
}

//%
//% weight=100 color=#008B00 icon="\uf136" block="Maqueen Compat"
namespace maqueenCompat {
    export enum BoardVersion {
        //% block="auto"
        Auto = 0,
        //% block="Maqueen v4"
        V4 = 4,
        //% block="Maqueen v5"
        V5 = 5
    }

    export enum Motors {
        //% blockId="maqueen_compat_motor_left" block="left"
        M1 = 0,
        //% blockId="maqueen_compat_motor_right" block="right"
        M2 = 1,
        //% blockId="maqueen_compat_motor_all" block="all"
        All = 2
    }

    export enum Servos {
        //% blockId="maqueen_compat_servo_s1" block="S1"
        S1 = 0,
        //% blockId="maqueen_compat_servo_s2" block="S2"
        S2 = 1
    }

    export enum Dir {
        //% blockId="maqueen_compat_dir_forward" block="Forward"
        CW = 0x00,
        //% blockId="maqueen_compat_dir_backward" block="Backward"
        CCW = 0x01
    }

    export enum Patrol {
        //% blockId="maqueen_compat_patrol_left" block="left"
        PatrolLeft = 13,
        //% blockId="maqueen_compat_patrol_right" block="right"
        PatrolRight = 14
    }

    export enum Patrol1 {
        //% blockId="maqueen_compat_patrol_left_event" block="left"
        PatrolLeft = 0x10,
        //% blockId="maqueen_compat_patrol_right_event" block="right"
        PatrolRight = 0x20
    }

    export enum Voltage {
        //% block="white (1)"
        High = 0x01,
        //% block="black (0)"
        Low = 0x00
    }

    export enum LED {
        //% blockId="maqueen_compat_led_left" block="left"
        LEDLeft = 8,
        //% blockId="maqueen_compat_led_right" block="right"
        LEDRight = 12
    }

    export enum LEDswitch {
        //% blockId="maqueen_compat_led_on" block="ON"
        turnOn = 0x01,
        //% blockId="maqueen_compat_led_off" block="OFF"
        turnOff = 0x00
    }

    const I2C_ADDRESS = 0x10
    const MOTOR_LEFT = 0x00
    const MOTOR_RIGHT = 0x02
    const V5_RGB_LEFT = 11
    const V5_RGB_RIGHT = 12
    const V5_SERVO_1 = 20
    const V5_SERVO_2 = 21
    const V5_BLACK_ADC_STATE = 29
    const V5_ADC_LEFT = 32
    const V5_ADC_RIGHT = 36
    const V5_SYS_INIT = 70

    let boardMode = BoardVersion.Auto
    let detectedBoard = BoardVersion.Auto
    let v5Initialized = false
    let lineCallbacks: MaqueenCompatLineEvent[] = []
    let patrolScanStep = 1

    /**
     * Select the Maqueen version. Auto is usually enough; choose v5 if line sensor values do not change.
     * @param board Board version
     */
    //% weight=100
    //% blockId=maqueen_compat_board block="Maqueen Compat board %board"
    //% board.fieldEditor="gridpicker" board.fieldOptions.columns=3
    export function setBoardVersion(board: BoardVersion): void {
        boardMode = board
        detectedBoard = BoardVersion.Auto
        v5Initialized = false
        if (board == BoardVersion.V5) {
            initV5Once()
        }
    }

    /**
     * Prepare Maqueen before running a lesson program.
     * @param board Board version
     */
    //% weight=110
    //% blockId=maqueen_compat_init block="prepare Maqueen Compat %board"
    //% board.defl=maqueenCompat.BoardVersion.Auto
    //% board.fieldEditor="gridpicker" board.fieldOptions.columns=3
    export function init(board: BoardVersion = BoardVersion.Auto): void {
        setBoardVersion(board)
        if (board == BoardVersion.Auto) {
            activeBoardVersion()
        }
    }

    /**
     * Read the version number.
     */
    //% weight=95
    //% blockId=maqueen_compat_read_version block="get product information"
    export function IR_read_version(): string {
        pins.i2cWriteNumber(I2C_ADDRESS, 50, NumberFormat.UInt8BE)
        let dataLen = pins.i2cReadNumber(I2C_ADDRESS, NumberFormat.UInt8BE)
        pins.i2cWriteNumber(I2C_ADDRESS, 51, NumberFormat.UInt8BE)
        let buf = pins.i2cReadBuffer(I2C_ADDRESS, dataLen, false)
        let version = ""
        for (let i = 0; i < dataLen; i++) {
            version += String.fromCharCode(buf[i])
        }
        return version
    }

    /**
     * Set the direction and speed of Maqueen motor.
     * @param index Motor to run
     * @param direction Wheel direction
     * @param speed Wheel speed
     */
    //% weight=90
    //% blockId=maqueen_compat_motor_run block="motor|%index|move|%direction|at speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function motorRun(index: Motors, direction: Dir, speed: number): void {
        if (index == Motors.M1 || index == Motors.All) {
            writeMotor(MOTOR_LEFT, direction, speed)
        }
        if (index == Motors.M2 || index == Motors.All) {
            writeMotor(MOTOR_RIGHT, direction, speed)
        }
    }

    /**
     * Stop the Maqueen motor.
     * @param motors Motor to stop
     */
    //% weight=20
    //% blockId=maqueen_compat_motor_stop block="motor |%motors stop"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2
    export function motorStop(motors: Motors): void {
        motorRun(motors, Dir.CW, 0)
    }

    /**
     * Read line tracking sensor.
     * @param patrol Line sensor to read
     */
    //% weight=80
    //% blockId=maqueen_compat_read_patrol block="read |%patrol line tracking sensor"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2
    export function readPatrol(patrol: Patrol): number {
        if (activeBoardVersion() == BoardVersion.V5) {
            return readV5PatrolAsV4(patrol)
        }
        return readV4Patrol(patrol)
    }

    /**
     * Line tracking sensor event function.
     * @param value Sensor
     * @param vi Sensor value
     */
    //% weight=70
    //% blockId=maqueen_compat_line_event block="on|%value line tracking sensor|%vi"
    //% value.fieldEditor="gridpicker" value.fieldOptions.columns=2
    //% vi.fieldEditor="gridpicker" vi.fieldOptions.columns=2
    export function ltEvent(value: Patrol1, vi: Voltage, handler: Action): void {
        lineCallbacks.push({
            key: value + vi,
            action: handler
        })
    }

    /**
     * Read ultrasonic sensor in centimeters.
     */
    //% weight=60
    //% blockId=maqueen_compat_ultrasonic block="read ultrasonic sensor in cm"
    export function Ultrasonic(): number {
        let data = readUltrasonic()
        let retry = 0
        while (data == 0 && retry < 3) {
            data = readUltrasonic()
            retry += 1
        }
        if (data == 0) {
            return 500
        }
        return data
    }

    /**
     * Set the Maqueen servos.
     * @param index Servo channel
     * @param angle Servo angle
     */
    //% weight=50
    //% blockId=maqueen_compat_servo_run block="servo|%index|angle|%angle"
    //% angle.min=0 angle.max=180
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    export function servoRun(index: Servos, angle: number): void {
        let buf = pins.createBuffer(2)
        if (index == Servos.S1) {
            buf[0] = V5_SERVO_1
        } else {
            buf[0] = V5_SERVO_2
        }
        buf[1] = angle
        pins.i2cWriteBuffer(I2C_ADDRESS, buf)
    }

    /**
     * Turn on/off the LEDs.
     * @param led LED to operate
     * @param ledswitch Operation to perform
     */
    //% weight=40
    //% blockId=maqueen_compat_write_led block="LEDlight |%led turn |%ledswitch"
    //% led.fieldEditor="gridpicker" led.fieldOptions.columns=2
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    export function writeLED(led: LED, ledswitch: LEDswitch): void {
        if (activeBoardVersion() == BoardVersion.V5) {
            writeV5Led(led, ledswitch)
        } else if (led == LED.LEDLeft) {
            pins.digitalWritePin(DigitalPin.P8, ledswitch)
        } else if (led == LED.LEDRight) {
            pins.digitalWritePin(DigitalPin.P12, ledswitch)
        }
    }

    function writeMotor(register: number, direction: Dir, speed: number): void {
        let buf = pins.createBuffer(3)
        buf[0] = register
        buf[1] = direction
        buf[2] = speed
        pins.i2cWriteBuffer(I2C_ADDRESS, buf)
    }

    function readV4Patrol(patrol: Patrol): number {
        if (patrol == Patrol.PatrolLeft) {
            return pins.digitalReadPin(DigitalPin.P13)
        } else if (patrol == Patrol.PatrolRight) {
            return pins.digitalReadPin(DigitalPin.P14)
        }
        return -1
    }

    function activeBoardVersion(): BoardVersion {
        if (boardMode == BoardVersion.V4) {
            return BoardVersion.V4
        } else if (boardMode == BoardVersion.V5) {
            initV5Once()
            return BoardVersion.V5
        }

        if (detectedBoard == BoardVersion.Auto) {
            if (looksLikeV5LineSensor()) {
                detectedBoard = BoardVersion.V5
                initV5Once()
            } else {
                initV5Once()
                if (looksLikeV5LineSensor()) {
                    detectedBoard = BoardVersion.V5
                } else {
                    detectedBoard = BoardVersion.V4
                }
            }
        }

        return detectedBoard
    }

    function looksLikeV5LineSensor(): boolean {
        let state = readV5LineState()
        let left = readV5PatrolAdc(Patrol.PatrolLeft)
        let right = readV5PatrolAdc(Patrol.PatrolRight)

        return state >= 0 && state <= 7 && (isV5LineAdc(left) || isV5LineAdc(right))
    }

    function initV5Once(): void {
        if (v5Initialized) {
            return
        }

        let buf = pins.createBuffer(2)
        buf[0] = V5_SYS_INIT
        buf[1] = 1
        pins.i2cWriteBuffer(I2C_ADDRESS, buf)
        basic.pause(100)
        v5Initialized = true
    }

    function isV5LineAdc(value: number): boolean {
        return value >= 1000 && value <= 4095
    }

    function readV5LineState(): number {
        pins.i2cWriteNumber(I2C_ADDRESS, V5_BLACK_ADC_STATE, NumberFormat.UInt8BE)
        return pins.i2cReadNumber(I2C_ADDRESS, NumberFormat.UInt8BE, false)
    }

    function readV5PatrolAdc(patrol: Patrol): number {
        if (patrol == Patrol.PatrolLeft) {
            pins.i2cWriteNumber(I2C_ADDRESS, V5_ADC_LEFT, NumberFormat.Int8LE)
        } else if (patrol == Patrol.PatrolRight) {
            pins.i2cWriteNumber(I2C_ADDRESS, V5_ADC_RIGHT, NumberFormat.Int8LE)
        } else {
            return 0
        }

        let buf = pins.i2cReadBuffer(I2C_ADDRESS, 2)
        return buf[0] << 8 | buf[1]
    }

    function readV5PatrolAsV4(patrol: Patrol): number {
        let bit = 0
        if (patrol == Patrol.PatrolLeft) {
            bit = 2
        } else if (patrol == Patrol.PatrolRight) {
            bit = 0
        } else {
            return -1
        }

        if (readV5LineState() & (1 << bit)) {
            return 0
        }
        return 1
    }

    function writeV5Led(led: LED, ledswitch: LEDswitch): void {
        let color = ledswitch == LEDswitch.turnOn ? 7 : 8
        if (led == LED.LEDLeft) {
            writeV5LedRegister(V5_RGB_LEFT, color)
        } else if (led == LED.LEDRight) {
            writeV5LedRegister(V5_RGB_RIGHT, color)
        }
    }

    function writeV5LedRegister(register: number, color: number): void {
        let buf = pins.createBuffer(2)
        buf[0] = register
        buf[1] = color
        pins.i2cWriteBuffer(I2C_ADDRESS, buf)
    }

    function readUltrasonic(): number {
        let d = 0
        pins.digitalWritePin(DigitalPin.P1, 1)
        basic.pause(1)
        pins.digitalWritePin(DigitalPin.P1, 0)
        if (pins.digitalReadPin(DigitalPin.P2) == 0) {
            pins.digitalWritePin(DigitalPin.P1, 0)
            pins.digitalWritePin(DigitalPin.P1, 1)
            basic.pause(20)
            pins.digitalWritePin(DigitalPin.P1, 0)
            d = pins.pulseIn(DigitalPin.P2, PulseValue.High, 500 * 58)
        } else {
            pins.digitalWritePin(DigitalPin.P1, 1)
            pins.digitalWritePin(DigitalPin.P1, 0)
            basic.pause(20)
            pins.digitalWritePin(DigitalPin.P1, 0)
            d = pins.pulseIn(DigitalPin.P2, PulseValue.Low, 500 * 58)
        }
        return Math.round(d / 59)
    }

    function patrolEventState(): number {
        let state = 0
        switch (patrolScanStep) {
            case 1:
                state = readPatrol(Patrol.PatrolLeft) == 0 ? 0x10 : 0
                break
            case 2:
                state = readPatrol(Patrol.PatrolLeft) == 1 ? 0x11 : 0
                break
            case 3:
                state = readPatrol(Patrol.PatrolRight) == 0 ? 0x20 : 0
                break
            default:
                state = readPatrol(Patrol.PatrolRight) == 1 ? 0x21 : 0
                break
        }

        patrolScanStep += 1
        if (patrolScanStep == 5) {
            patrolScanStep = 1
        }

        return state
    }

    basic.forever(() => {
        if (lineCallbacks.length > 0) {
            let state = patrolEventState()
            if (state != 0) {
                for (let item of lineCallbacks) {
                    if (item.key == state) {
                        item.action()
                    }
                }
            }
        }
        basic.pause(50)
    })
}

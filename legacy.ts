namespace maqueenCompat {
    /**
     * Legacy block ID for projects created before compat block IDs were namespaced.
     */
    //% blockId=IR_read_version block="get product information"
    //% blockHidden=1 deprecated=1
    export function legacyReadVersion(): string {
        return IR_read_version()
    }

    /**
     * Legacy block ID for projects created before compat block IDs were namespaced.
     */
    //% blockId=motor_MotorRun block="motor|%index|move|%direction|at speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    //% blockHidden=1 deprecated=1
    export function legacyMotorRun(index: Motors, direction: Dir, speed: number): void {
        motorRun(index, direction, speed)
    }

    /**
     * Legacy block ID for projects created before compat block IDs were namespaced.
     */
    //% blockId=motor_motorStop block="motor |%motors stop"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2
    //% blockHidden=1 deprecated=1
    export function legacyMotorStop(motors: Motors): void {
        motorStop(motors)
    }

    /**
     * Legacy block ID for projects created before compat block IDs were namespaced.
     */
    //% blockId=read_Patrol block="read |%patrol line tracking sensor"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2
    //% blockHidden=1 deprecated=1
    export function legacyReadPatrol(patrol: Patrol): number {
        return readPatrol(patrol)
    }

    /**
     * Legacy block ID for projects created before compat block IDs were namespaced.
     */
    //% blockId=kb_event block="on|%value line tracking sensor|%vi"
    //% value.fieldEditor="gridpicker" value.fieldOptions.columns=2
    //% vi.fieldEditor="gridpicker" vi.fieldOptions.columns=2
    //% blockHidden=1 deprecated=1
    export function legacyLtEvent(value: Patrol1, vi: Voltage, handler: Action): void {
        ltEvent(value, vi, handler)
    }

    /**
     * Legacy block ID for projects created before compat block IDs were namespaced.
     */
    //% blockId=ultrasonic_sensor block="read ultrasonic sensor in cm"
    //% blockHidden=1 deprecated=1
    export function legacyUltrasonic(): number {
        return Ultrasonic()
    }

    /**
     * Legacy block ID for projects created before compat block IDs were namespaced.
     */
    //% blockId=servo_ServoRun block="servo|%index|angle|%angle"
    //% angle.min=0 angle.max=180
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% blockHidden=1 deprecated=1
    export function legacyServoRun(index: Servos, angle: number): void {
        servoRun(index, angle)
    }

    /**
     * Legacy block ID for projects created before compat block IDs were namespaced.
     */
    //% blockId=writeLED block="LEDlight |%led turn |%ledswitch"
    //% led.fieldEditor="gridpicker" led.fieldOptions.columns=2
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    //% blockHidden=1 deprecated=1
    export function legacyWriteLED(led: LED, ledswitch: LEDswitch): void {
        writeLED(led, ledswitch)
    }
}

//
// user events
//

export enum DeviceTypes {
    None  =0,
    Touch =1,
    Mouse =2
}

export enum ButtonPress {
    Wheel=-1,
    None =0,
    Left =1,
    Right=2,
    LeftAndRight =3
} 

export type Point = {
    x: number,
    y: number
}
export type TouchEvent = {
    pointers : Point []
}

export type MouseEvent = {
    button : ButtonPress,
    mousePoint : Point | null // null when the mouse is leaving the window.
    mouseWheel : Point | null // null when the mouse is leaving the window.
}

export type UserEvent = {
    device : DeviceTypes,
    event  : MouseEvent | TouchEvent | null // null only in case of DeviceType.None
}

export const NoEvent = { device : DeviceTypes.None, event : null }

export function Point2DOM( point : Point ) : DOMPoint {
    return new DOMPoint(point.x, point.y, 0, 1)
}

export function DOM2Point( domPoint : DOMPoint ) : Point {
    return {
        x : domPoint.x,
        y : domPoint.y
    }
}

const empty = {}
export default empty
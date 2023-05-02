export class Utils {
    public static objectsToArray(obj) {
        return Object.entries(obj).map(([key, value]) => value);
    }
}
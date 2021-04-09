export function findStringIn(str1: string, str2: string): boolean {
    str1 = str1.toLocaleLowerCase();
    str2 = str2.toLocaleLowerCase();
    const str3 = str2.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return str2.indexOf(str1) >= 0 || str3.indexOf(str1) >= 0;
}

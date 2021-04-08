import { of } from 'rxjs';
import { concatMap, delay, map } from 'rxjs/operators';

const _100 = 100;

// vetva Fokosi, Fokosky, Gen, Medved,
// komunita Lipany, BA, Piestany
// stretko Widovci, Jancisinovci, BA1, BA2 ..

export interface Person {
    id: number;
    name: string;
    maidenName?: string;
    addresses?: Address[];
    contacts?: Contact[];
    disabilities?: string;
    capabilities?: string;
    birthYear?: number;
    tags?: Tag[];
}

export interface Tag {
    text: string;
}

export interface Address {
    text: string;
}

export interface Contact {
    type: 'email' | 'phone';
    text: string;
}

export interface Relation {
    id: number;
    person: number;
    type: 'child' | 'wife' | 'group_member';
    of: number;
}

const Persons: Person[] = [
    {
        id: 1,
        name: 'Dávid Sládeček',
        addresses: [{ text: 'Limbach' }],
        contacts: [
            { type: 'phone', text: '090DavidSld' },
            { type: 'email', text: 'sladecek@plaut' },
        ],
        birthYear: 1978,
    },
    {
        id: 2,
        name: 'Eva Sládečková',
        addresses: [{ text: 'Limbach' }],
    },
    {
        id: 3,
        name: 'Milan Sládeček',
        addresses: [{ text: 'Košice' }],
        contacts: [{ type: 'phone', text: '090MilanSld' }],
        birthYear: 1951,
    },
    {
        id: 4,
        name: 'Božena Sládečková',
        addresses: [{ text: 'Košice' }],
        birthYear: 1951,
    },
];

const Relations: Relation[] = [
    { id: 1, person: 1, type: 'child', of: 3 },
    { id: 1, person: 1, type: 'child', of: 4 },
    { id: 2, person: 2, type: 'wife', of: 1 },
];

export class PersonsResource {
    static getPersons() {
        return of(Persons).pipe(delay(_100));
    }
    static getPerson(id: number) {
        return this.getPersons().pipe(map(items => items.find(item => item.id === id)));
    }
    static getAddresses(id: number) {
        return this.getPerson(id).pipe(map(person => person?.addresses || []));
    }
}

export class RlationsResource {
    static getItems() {
        return of(Relations).pipe(delay(_100));
    }
    static getParents(personId: number) {
        return this.getItems().pipe(
            map(items => items.find(item => item.type === 'child' && item.person === personId))
        );
    }
    static getChildren(personId: number) {
        return this.getItems().pipe(map(items => items.find(item => item.type === 'child' && item.of === personId)));
    }
}

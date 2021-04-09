import { ɵInternalFormsSharedModule } from '@angular/forms';
import { combineLatest, Observable, of } from 'rxjs';
import { concatMap, delay, filter, map } from 'rxjs/operators';

const _100 = 100;

// vetva Fokosi, Fokosky, Gen, Medved,
// komunita Lipany, BA, Piestany
// stretko Widovci, Jancisinovci, BA1, BA2 ..

export interface Person {
    id: number;
    name: string;
    born?: string;
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

export interface RelationMap {
    id: number;
    person: number;
    type: 'child' | 'wife' | 'group_member';
    of: number;
}

export interface Relation {
    id: number;
    person: Person;
    type: 'child' | 'wife' | 'group_member';
    of: Person;
    startDate?: string;
    endDate?: string;
}

export interface Family {
    id: number;
    man: Person;
    woman: Person;
    children: Person[];
}

const Persons: Person[] = [
    {
        id: 1,
        name: 'Princess Elisabeth II of York',
        contacts: [],
        birthYear: 1926,
    },
    {
        id: 2,
        name: 'Prince Philipp, Duke of Edinburgh',
        born: 'Prince Philip of Greece and Denmark',
        addresses: [],
        birthYear: 1921,
    },
    {
        id: 3,
        name: 'Charles, Prince of Wales',
        birthYear: 1948,
    },
    {
        id: 4,
        name: 'Lady Diana Spencer',
        birthYear: 1961,
    },
    {
        id: 5,
        name: 'Prince William, Duke of Cambridge',
        birthYear: 1982,
    },
    {
        id: 6,
        name: 'Catherine, Duchess of Cambridge',
        born: 'Catherine Elizabeth Middleton',
        birthYear: 1982,
    },
    {
        id: 99,
        name: 'ÄěŘčŤšĽŔô',
    },
];

const Relations: RelationMap[] = [
    { id: 1, person: 1, type: 'wife', of: 2 },
    { id: 2, person: 4, type: 'wife', of: 3 },
    { id: 3, person: 6, type: 'wife', of: 5 },
    { id: 4, person: 3, type: 'child', of: 1 },
    { id: 5, person: 5, type: 'child', of: 4 },
];

export class PersonsResource {
    static getPersons() {
        return of(Persons).pipe(delay(_100));
    }
    static getPerson(id: number) {
        return this.getPersons().pipe(map((items) => items.find((item) => item.id === id)));
    }
    static getAddresses(id: number) {
        return this.getPerson(id).pipe(map((person) => person?.addresses || []));
    }
}

export class RelationsResource {
    static getItems() {
        return of(Relations).pipe(delay(_100));
    }
    static getParents(personId: number) {
        return this.getItems().pipe(
            map((items) => items.find((item) => item.type === 'child' && item.person === personId))
        );
    }
    static getChildren(personId: number) {
        return this.getItems().pipe(
            map((items) => items.find((item) => item.type === 'child' && item.of === personId))
        );
    }
    static getCouples(): Observable<Relation[]> {
        return combineLatest([this.getItems(), PersonsResource.getPersons()]).pipe(
            map(([relations, persons]) => {
                const couples = relations.filter((r) => r.type === 'wife');
                return couples.map((couple) => ({
                    ...couple,
                    person: persons.find((p) => p.id === couple.person)!,
                    of: persons.find((p) => p.id === couple.of)!,
                }));
            })
        );
    }
    static getFamilies(): Observable<Family[]> {
        return combineLatest([this.getItems(), PersonsResource.getPersons()]).pipe(
            map(([relations, persons]) => {
                const couples = relations.filter((r) => r.type === 'wife');
                const children = relations.filter((r) => r.type === 'child');
                return couples.map((couple) => ({
                    id: couple.id,
                    man: persons.find((p) => p.id === couple.person)!,
                    woman: persons.find((p) => p.id === couple.of)!,
                    children: children
                        .filter((c) => c.of === couple.person || c.of === couple.of)
                        .map((c) => persons.find((p) => p.id === c.person)!),
                }));
            })
        );
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCountries = seedCountries;
const Mysql_1 = require("../Mysql");
const entities_1 = require("../../persistence/typeorm/entities");
const LATIN_AMERICA_COUNTRIES = [
    'Bolivia',
    'Argentina',
    'Brasil',
    'Chile',
    'Colombia',
    'Perú',
    'Ecuador',
    'Venezuela',
    'Uruguay',
    'Paraguay',
];
async function seedCountries() {
    try {
        const countryRepo = Mysql_1.AppDataSource.getRepository(entities_1.CountryEntity);
        const count = await countryRepo.count();
        if (count === 0) {
            console.log('Seeding countries...');
            const countries = LATIN_AMERICA_COUNTRIES.map(name => ({ name }));
            await countryRepo.save(countries);
            console.log(`✓ ${countries.length} countries seeded successfully`);
        }
        else {
            console.log('Countries table already populated, skipping seed');
        }
    }
    catch (error) {
        console.error('Error seeding countries:', error);
        throw error;
    }
}
//# sourceMappingURL=CountrySeeder.js.map
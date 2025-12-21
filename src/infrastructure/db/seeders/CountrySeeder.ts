
import { AppDataSource } from "../Mysql";
import { CountryEntity } from "../../persistence/typeorm/entities";
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
    'Paraguay'
];

export async function seedCountries(): Promise<void> {
    try {
        const countryRepo = AppDataSource.getRepository(CountryEntity);
        const count = await countryRepo.count();

        if (count === 0) {
            console.log('Seeding countries...');
            const countries = LATIN_AMERICA_COUNTRIES.map(name => ({ name }));
            await countryRepo.save(countries);
            console.log(`✓ ${countries.length} countries seeded successfully`);
        } else {
            console.log('Countries table already populated, skipping seed');
        }
    } catch (error) {
        console.error('Error seeding countries:', error);
        throw error;
    }
}

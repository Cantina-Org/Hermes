import { createConnection } from "mysql";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from 'url';


export function queryDatabase(query, callback) {

    const credentials = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../config.json'), 'utf8'));

    const connection = createConnection({
        host: '127.0.0.1',
        user: credentials.database[0].database_username,
        password: credentials.database[0].database_password,
        database: 'cantina_administration'
    });
    connection.connect((err) => {
        if (err) {
            console.error('Erreur de connexion à la base de données:', err);
            return;
        }
        connection.query(query, (error, results) => {
            if (error) {
                console.error('Erreur lors de l\'exécution de la requête:', error);
                return;
            }
            let finalResults = JSON.parse(JSON.stringify(results))
            callback(finalResults);
            connection.end((err) => {
                if (err) {
                    console.error('Erreur lors de la fermeture de la connexion à la base de données:', err);
                }
            });
        });
    });
}
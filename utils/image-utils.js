const fs = require('fs');

async function removeOldImage(old_name) {
    try {
        await fs.promises.stat(`./uploads/${old_name}`);
        // si existe el archivo entonces lo eliminamos
        await fs.promises.unlink(`./uploads/${old_name}`);
        console.log('Se elimino la imagen: ' + `./uploads/${old_name}`)
    } catch (err) {
        console.log(err);
    }
}

async function saveImage(base64Image, name, extension, old_name) {
    const result = { img_name: '', err: undefined };
    try {
        // si old_name no es null signfica que es una actualizacion asi que se elimina
        if (old_name) {
            await removeOldImage(old_name);
        }
        const curated_data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = new Buffer.from(curated_data, 'base64');
        await fs.promises.writeFile(`./uploads/${name}.${extension}`, imageBuffer, 'binary');
        console.log(`Imagen ${name}.${extension} se ha almacenado correctamente.`);
        result.img_name = `${name}.${extension}`;
    } catch (err) {
        console.log(err);
        result.err = err;
    }
    return result;
}

module.exports = saveImage;
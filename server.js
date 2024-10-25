const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

async function getProducts(query, sort, offset = 0) {
    const url = `https://api.mercadolibre.com/sites/MLB/search?q=${query}&offset=${offset}&limit=10`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        const results = data.results || [];
        const totalResults = data.paging ? data.paging.total : 0;
        const totalPages = Math.ceil(totalResults / 10);

        const products = results.map(product => ({
            title: product.title || 'Título indisponível',
            price: product.price ? product.price.toFixed(2).replace('.', ',') : '0,00',
            link: product.permalink || '#',
            image: product.thumbnail || 'https://via.placeholder.com/150',
        }));

        return { products, totalPages };
    } catch (error) {
        console.error('Erro ao buscar produtos:', error.message);
        return { products: [], totalPages: 0 };
    }
}

app.get('/', (req, res) => {
    res.render('index', { products: [], query: '', sort: '', currentPage: 1, totalPages: 0 });
});

app.post('/', async (req, res) => {
    const query = req.body.query || '';
    const sort = req.body.sort || 'relevance';
    const page = parseInt(req.body.page) || 1;
    const offset = (page - 1) * 10;

    const { products, totalPages } = await getProducts(query, sort, offset);

    res.render('index', { products, query, sort, currentPage: page, totalPages });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

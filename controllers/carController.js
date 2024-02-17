const carData = require('../data/carData.json');

exports.getYears = (req, res) => {
    const years = carData.data.flatMap(item => item.years.map(year => year.year));
    res.json(years);
};

exports.getMakes = (req, res) => {
    const { year } = req.params;
    const makes = carData.data.flatMap(item => 
        item.years
            .filter(yearItem => yearItem.year.toString() === year)
            .flatMap(yearItem => yearItem.makes.map(make => ({ makeId: make.makeId, makeName: make.makeName })))
    );
    res.json(makes);
};

exports.getModels = (req, res) => {
    const { year, makeId } = req.query;
    const models = carData.data.flatMap(item => 
        item.years
            .filter(yearItem => yearItem.year.toString() === year)
            .flatMap(yearItem => 
                yearItem.makes
                    .filter(make => make.makeId === makeId)
                    .flatMap(make => make.models)
            )
    );
    res.json(models);
};

class apiFeatures{
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    let queryObj = {...this.queryStr};

    const exclude = ['fields', 'sort', 'page', 'limit'];

    exclude.forEach(el => delete queryObj[el]);

    let queryString = JSON.stringify(queryObj);
    
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let queryObject = JSON.parse(queryString);

    this.query = this.query.find(queryObject);

    return this;
  }

  sort() {
    if(this.queryStr.sort) {
      const sort = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sort);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this
  }

  limitFields() {
     if(this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const page = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit) || 10;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
   
    // if(this.queryStr.page) {
    //   const count = await Product.countDocuments();
    //   if(skip >= count) {
    //     throw new Error("Page not found");
    //   }
    // }

    return this;
  }
}

module.exports = apiFeatures;
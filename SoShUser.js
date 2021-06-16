class User {
    constructor(name, posts) {
        this.name = name;
        this.post = posts;
    }
  
    get userName(){
        return n();
    }
  
    n() {
  
        const gmail = google.gmail({version: 'v1', auth});
        return gmail.users.getProfile.name // name of user gmail
  
    };
  
    get userPosts() {
        return p();
    }
  
    p(){
  
        return posts;
  
    }
  
  
  
  
  
  }
  
  class Body {
    constructor(bod) {
        this.bod = bod;
      }
  
    get post(){
        return this.createPost();
    }
  
    get isPost(){
      return isPurchase();
    }
  
    isPurchase(){
      const regex = /(Total )[\$][\d]+[\.][\d]{2}/g;
      if(this.bod.matchAll(regex) != []){
        return true;
      } else {
        return false;
      }
    }
  
    createPost(){
        const regex = /(Total )[\$][\d]+[\.][\d]{2}/g;
        const rt = /^(\D.*\S)\s+\$([0-9.]+)\)?\s*/gim
        const website = /[\w]+[\.](com)/gim
        const subdomains = /.*\.(edu|com|net|org)$/
        const name = website.replace(".com", "");
        const clean = /\r?\n|\r/g;
        const foundcom = [...paragraph.matchAll(r)];
        const namec = foundcom[0][0].match(n);
        const price = [...paragraph.matchAll(rt)];
        const w = foundcom[0][0].replace(clean, "");
        const c = namec.replace(clean, "");
        const p = price[0][1].replace(clean, "");
        const i = "";
        const l = "";
        const im = "";
        return new Post(w, c, i, p, l, im);
    }
  }
  
  class Post {
    constructor(website, company, item, price, link, image) {
      this.website = website;
      this.company = company;
      this.item = item;
      this.price = price;
      this.link = link;
      this.image = image;
    }
    // Getter
    get data() {
      return this.returnData();
    }
    // Method
    returnData() {
      return {"website": this.website,
      "company": this.company,
      "item": this.item,
      "price": this.price,
      "link": this.link,
      "image": this.image};
    }
  }
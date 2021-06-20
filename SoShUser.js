const parser = new DOMParser();

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
      return this.isPurchase();
    }
  
    isPurchase(){
      const regex = /((recei(pts?|ved)|confirm(ation|ed)|purchas(ed?|e)|total|order))/gi;
      if(this.bod.matchAll(regex) != []){
        return true;
      } else {
        return false;
      }
    }
  
    createPost(){
        const doc3 = parser.parseFromString(this.bod, "text/html");
        const nq = /(.+\s+)((qty|Qty|Quantity|quantity)\W+\s+)+([0-9]+)/gi;
        const y = doc3.body.firstChild.textContent;
        const regex = /(Total )[\$][\d]+[\.][\d]{2}/g;
        const rt = /^(\D.*\S)\s+\$([0-9.]+)\)?\s*/gim;
        const website = /[\w]+[\.](com)/gim
        const subdomains = /.*\.(edu|com|net|org)$/
        //const name = website.replace(".com", "");
        const clean = /\r?\n|\r/g;
        var foundcom = [...y.matchAll(website)];
        if(foundcom.length != 0){
          var namec = foundcom[0][0].replace(".com", "");
          var w = foundcom[0][0].replace(clean, "");
          var c = namec.replace(clean, "");
        } else {
          namec = "";
          w = "";
          c = "";
        }
        var price = [...y.matchAll(rt)];
        if(price.length != 0){
          var p = price[0][1].replace(clean, "");
        } else {
          p = "";
        }
        const quan = [...y.matchAll(nq)];
        var i;
        if(quan.length != 0){
          console.log(quan);
          const qu = quan[0][0].replace(clean, "");
          i = qu;
        } else if(price.length != 0){
          i = price[0][0].replace(clean,"")
        } else {
          i = "";
        }
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

  
const parser = new DOMParser();

const commerce_api_key = "fd9acead3484e90a065057c2696ef798";
const commerce_secret_key = "2541b85dd9d09d094cae96e64e108253591395f6";

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
      var is = false;
      const regex = /((recei(pts?|ved)|confirm(ation|ed)|purchas(ed?|e)|total|order))/gi;
      const doc3 = parser.parseFromString(this.bod, "text/html");
      const y = doc3.body.firstChild.textContent;
      const website = /[\w]+[\.](com)/gim
      const rt = /^(\D.*\S)\s+\$([0-9.]+)\)?\s*/gim;
      //const name = website.replace(".com", "");
      const clean = /\r?\n|\r/g;
      var foundcom = [...y.matchAll(website)];
      if([...y.matchAll(regex)].length != 0 ){
        if(foundcom.length != 0){
          foundcom.forEach((e)=>{
            if(e[0] != "gmail.com" && e[0] != "google.com" && e[0] != undefined){
              is = true;
            }
          })
          var price = [...y.matchAll(rt)];
          if(price.length != 0){
            is = true;
          } else {
            is = false;
          }
          return is;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

  
    async createPost(){
      var im = "";
      var affiliate_link;
      var e;
      var w;
      var c;
      var l = "";
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
          foundcom.forEach((e)=>{
            if(e[0] != "gmail.com" && e[0] != "google.com" && e[0] != undefined){
              var namec = e[0].replace(".com", "");
              w = e[0].replace(clean, "");
              c = namec.replace(clean, "");
            } 
          })
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
          i = price[0][2].replace(clean,"")
        } else {
          i = "";
        }

    const checkD = () => {

      if(w != ""){
      
    fetch(`https://publishers.viglink.com/api/merchant/search?domain=${w}`, {
        method: 'get',
        headers: { 
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': 'https://soshwrld.com',
          'Vary': 'Origin',
          'Authorization': `${commerce_secret_key}`
       }
    })
    .then(res => res.json())
    .then((json) => {
      //check domain ----------------------------------------------------> 
      console.log(json)
      json.merchants.forEach((a)=>{
        a.domains.forEach((v)=>{
          if(v === w){
            return true;
          }
        });
      })
      return false;
    })
    .catch((err)=>{
      //fake domain - fake purchase
      console.log(err)
    });
  }
}

if(p != ""){

  await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyAUSNeT750wI-oDmpQm4AZcsYmZfc-ShSU&cx=430def6a414e30530&q=\"${p}\":${w}`)
  .then(async (res)=>{return await res.json()})
  .then((res) => {
    l = res.items[0].link;
    im = res.items[0].pagemap.cse_thumbnail[0].src;
    console.log(l)
    console.log(im)
    console.log(res.items[0].link, res.items[0].pagemap.cse_thumbnail[0].src)
    return new Post(w, c, i, p, l, im);
  })
  .catch((err) => {
  console.log(err);
  });

    // fetch(`https://api.viglink.com/api/link?format=json&out=${l}&key=${commerce_api_key}`)
    //     .then(res => res.json())
    //     .then((json) => {
    //       if(json.affiliable){
    //         affiliate_link = json.optimized; //------------------------------------------------>
    //         e = parseFloat(json.eepc) * 100; //convert to %
    //       } else {
    //         affiliate_link = "";
    //         e = "";
    //       }
    //   console.log(json)
    // }).catch((err)=>{
    //   //failed to get aff
    //         affiliate_link = "";
    //         e = "";
    //   console.log(err);
    // });

  }



    // gapi.client.search.cse.list({
    //   "c2coff": "1",
    //   "cx": "430def6a414e30530",
    //   "q": `\"${itemName}\":${domainName}`
    // })
    //     .then(function(response) {
    //             // Handle the results here (response.result has the parsed body).
    //             console.log("Response", response);
    //             console.log(response.result.items[0].link);
    //             const l = response.result.items[0].link; // product link
    //           },
    //           function(err) { console.error("Execute error", err); });

    //grab all images from product url
            //   const craw = new Crawler({
            //     callback: function(error, res, done) {
            //         if (error) {
            //             console.log({error})
            //         } else {
            //             const images = res.$('img')
            //             images.each(index => {
            //                 // here you can save the file or save them in an array to download them later
            //                 productImages.push({src: images[index].attribs.src, alt: images[index].attribs.alt})
                            
            //             })
            //         }
            //     }
            // })
            
            // craw.queue(l)
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

  
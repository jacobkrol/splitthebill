
window.onload = function() {
    presetup();
    setup();
}

function Bill() {
    this.people = [];
    this.items = [];
    this.subtotal = 0;
    this.total = 0;
    this.results = [];
    this.page = 1;
    this.n = 0;
    this.tag = 0;
}

function presetup() {
    setFontSize();
    $("body").css("max-width", 400);
    // if ($.browser.mozilla){
    //         $('body').css('MozTransform','scale(2)');
    //     } else {
    //         $('body').css('zoom', '200%');
    //     }
    setButtonListeners();
}

function setup() {
    bill = new Bill();
    $("#person-data").empty();
    addPerson();
    adjustPageView();
}

function setFontSize() {
    let scale = $(window).width()/250;
    scale = 1;
    document.body.style.setProperty('--size1', scale*10);
    document.body.style.setProperty('--small', scale*13);
    //document.body.style.setProp
    document.body.style.setProperty('--medium', scale*24);
    document.body.style.setProperty('--large', scale*36);
    //12,24,36
    //$("a,h1,p,input[type='text'],input[type='button']");
}

function setButtonListeners() {
    $(".add").on("click", add);
    $(".submit").on("click", submit);
    $(".back").on("click", back);
    $(".restart").on("click", restart);
    $("#home").on("click", restart);
}

function adjustPageView() {
    //people, order, total, result, error
    $("#people,#order,#total,#result,#error").hide();
    switch(bill.page) {
        case 1:
            $("#people").show();
            //$("#rpeople1").on("click", (event) => { removePerson(1) } );
            break;
        case 2:
            $("#order").show();
            //$("#ritem1").on("click", (event) => { removeItem(1) } );
            break;
        case 3:
            $("#total").show();
            break;
        case 4:
            $("#result").show();
            break;
        default:
            $("#error").show();
            break;
    }
}

function next() {
    bill.page++;
    adjustPageView();
}

function getPerson(n) {
    return `<div style="display:block"><input id="person`+n+`" name="person`+n+`" type="text" placeholder="Name" class="person" />
    <input type="button" id="rpeople`+n+`" class="remove" value="x" /></div>`;
}

function getPeopleOptions() {
    let text = "";
    for(let i=0; i<bill.people.length; ++i) {
        text += `<option value="person`+i+`">`+bill.people[i]+`</option>`;
    }
    return text;
}

function getItem(n) {
    return `<div id="item`+n+`">
            <input name="item`+n+`" type="text" placeholder="Cost" class="item" />
            <select id="item`+n+`select"><option value="none">select...</option>
            `+getPeopleOptions()+`
            </select>
            <input type="button" id="ritem`+n+`" class="remove" value="x" />
            </div></div>`;
}

function getResult(result) {
    return `<p>`+result[0]+`: <span class="result">`+result[1].toFixed(2)+`</span></p>`;
}

function add() {
    switch(bill.page) {
        case 1:
            addPerson();
            break;
        case 2:
            addItem();
            break;
        default:
            error();
            break;
    }
}

function addPerson() {
    bill.n++;
    bill.tag++;
    $("#person-data").append(getPerson(bill.tag));
    let tag = "#rpeople"+bill.tag,
        value = bill.tag;
    $(tag).on("click", (event) => { removePerson(value) } );
}

function removePerson(n) {
    if(bill.n > 1) {
        let tag1 = "#person"+n,
            tag2 = "#rpeople"+n;
        $(tag1).remove();
        $(tag2).remove();
        bill.n--;
    } else {
        //console.log("cannot remove");
    }
}

function addItem() {
    bill.n++;
    bill.tag++;
    $("#item-data").append(getItem(bill.tag));
    let tag = "#ritem"+bill.tag,
        value = bill.tag;
    $(tag).on("click", (event) => { removeItem(value) } );
}

function removeItem(n) {
    if(bill.n > 1) {
        let tag1 = "#item"+n;
        $(tag1).remove();
        bill.n--;
    } else {
        //console.log("cannot remove");
    }
}

function submit() {
    switch(bill.page) {
        case 1:
            submitPeople();
            break;
        case 2:
            submitOrder();
            break;
        case 3:
            submitTotal();
            break;
        default:
            error();
            break;
    }
}

function submitPeople() {
    //save people inputs
    let inputs = $(".person");
    for(each of inputs) {
        if(each.value) {
            bill.people.push(each.value);
        }
    }
    //check if anyone was added
    if(bill.people.length) {
        //update order options
        $("#item-data").empty();
        bill.n = 0;
        bill.tag = 0;
        addItem();
        next();
    }
}

function submitOrder() {
    //save order inputs
    let inputs = $(".item"),
        valid = true;
    //clear old results
    bill.items = [];
    for(each of inputs) {
        if(each.value) {
            let tag = "#"+each.name+"select",
                choice = $(tag).val();
            console.log(choice);
            if(choice != "none") {
                person = bill.people[choice.substr(6)],
                item = each.value,
                citem = cleanAmount(item);
                if(citem) {
                    bill.items.push([citem,person]);
                } else {
                    valid = false;
                }
            }
        }
    }
    //check if items were added
    if(bill.items.length && valid) {
        //update total data
        $("input[name='total']")[0].value = "";
        bill.subtotal = calcSubtotal();
        $("#subtotal-data").html("$ "+bill.subtotal.toFixed(2));
        next();
    }
}

function submitTotal() {
    //save total
    let input = $("input[name='total']")[0].value,
        total = cleanAmount(input);
    bill.results = [];
    if(total) {
        bill.total = total;
        for(each of bill.people) {
            let name = each,
                sub = getPersonTotal(name),
                share = sub/bill.subtotal,
                res = share*bill.total;
            bill.results.push([name,res]);
        }
        fillResults();
        next();
    }
}

function getPersonTotal(name) {
    let sub = 0;
    for(each of bill.items) {
        if(each[1] === name) {
            sub += each[0];
        }
    }
    return sub;
}

function fillResults() {
    $("#result-data").empty();
    for(each of bill.results) {
        $("#result-data").append(getResult(each));
    }
}

function cleanAmount(val) {
    val = String(val);
    val.replace("$","");
    val.replace(" ","");
    val = Number(val);
    if(isNaN(val)) {
        return false;
    } else {
        return val;
    }
}

function calcSubtotal() {
    if(bill.items.length) {
        let sub = 0;
        for(each of bill.items) {
            sub += Number(each[0]);
        }
        return sub;
    } else {
        return 0;
    }
}

function back() {
    bill.page--;
    switch(bill.page) {
        case 1:
            $("#person-data").empty();
            bill.people = [];
            bill.n = 0;
            bill.tag = 0;
            addPerson();
            break;
        case 2:
            $("#item-data").empty();
            bill.items = [];
            bill.n = 0;
            bill.tag = 0;
            addItem();
            break;
        case 3:
            $("input[name='total']")[0].value = "";
            bill.total = 0;
            break;
        default:
            error();
            break;
    }
    adjustPageView();
}

function restart() {
    setup();
}

function error() {
    $("#people,#order,#total,#result").hide();
    $("#error").show();
}

function getDayOffset(day, offset){
    return (day == 0)? 2 + offset : (day == 6)? 1 + offset: offset;
}

function formatDateForUse(d, offset){
    return d.getFullYear()+""+(((d.getMonth() + 1)<10)? "0"+(d.getMonth() + 1):(d.getMonth() + 1))+""+( ((d.getDate() - offset)<10)? "0"+(d.getDate() - offset):(d.getDate() - offset));
}

function getLastBusinesDay(){
    let d = new Date('2019-08-31');
    let offset1 = getDayOffset(d.getDay(), -1);

    let daybefore = new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset1 - 1);
    let offset2 = getDayOffset(daybefore.getDay(), 0);

    let lbd = formatDateForUse(d, offset1);
    let lbd_ = formatDateForUse(daybefore, offset2);
    return {lbd1:lbd, lbd2:lbd_};
}

function getNextWork(d) {
    d.setDate(d.getDate()+1);
    if (d.getDay()==0) d.setDate(d.getDate()+1);
    else if (d.getDay()==6) d.setDate(d.getDate()+2);
    return d;
}

console.log(getLastBusinesDay());
console.log(getNextWork(new Date('2019-08-31 00:00:00')));


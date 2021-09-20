const cheerio=require('cheerio');
const request=require('request');
const fs=require('fs');

request("https://github.com/topics",requestcallback);

let gitTopics=[];
function requestcallback(err,res,html)
{
    const $=cheerio.load(html);
    let topicURLAnchorTags=$('.no-underline.d-flex.flex-column.flex-justify-center');
    for(let i=0;i<topicURLAnchorTags.length;i++)
    {
        let topicURL="https://github.com"+$($(topicURLAnchorTags)[i]).attr("href");
        gitTopics.push({
            "topicURL":topicURL,
            "repos":[]
        }
        );
        request(topicURL,fetchrepos.bind(this,i));
    }
}
let topicCounts=0;
let totalrepos=0;
let repocounts=0;
function fetchrepos(index,err,res,html)
{
    topicCounts++;
    const $=cheerio.load(html);
    let reposAnchorTags=$(".wb-break-word.text-bold");
    totalrepos+=(reposAnchorTags.length<8)? reposAnchorTags.length:8;
    for(let i=0;i<8 && i<reposAnchorTags.length;i++)
    {
        let repoURL="https://github.com"+$(reposAnchorTags[i]).attr("href");
        gitTopics[index].repos.push({
            "repoURL":repoURL,
            "issues":[]
        });
        request(repoURL+"/issues",fetchissues.bind(this,index,i));
    }
    /*if(topicCounts==3)
    {
        fs.writeFileSync("temp.json",JSON.stringify(gitTopics));
    }*/
}
function fetchissues(topicindex,repoindex,err,res,html)
{
    repocounts++;
    const $=cheerio.load(html);
    let issuesAnchorTags=$('.Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title');
    for(let i=0;i<8 && i<issuesAnchorTags.length;i++)
    {
        gitTopics[topicindex].repos[repoindex].issues.push(
            {
                "IssueName":$(issuesAnchorTags[i]).text(),
                "IssueURL":"https://github.com/"+$(issuesAnchorTags[i]).attr("href")
            });
    }
    if(topicCounts==3 && totalrepos==repocounts)
    {
        fs.writeFileSync("temp.json",JSON.stringify(gitTopics));
    }
}



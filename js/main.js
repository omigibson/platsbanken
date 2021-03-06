class Init {
    launch() {
        newController.checkUrlEnding();
        //Initializing of search functionality 
        newController.filterByOptions();
        newController.searchFieldEventlisteners();
        newController.shareSearchResult();
        newController.savedAdsButtonEventlistener();
        newController.closeErrorMessage();
        //Fetching values for options in filter.
        newFetch.fetchList(`/platsannonser/soklista/yrkesomraden`)
            .then(newDOM.displayFilterOptions);
        newFetch.fetchList(`/arbetsformedling/soklista/lan`)
            .then(newDOM.displayFilterOptions)
            .then(newController.countyDropdownEventlistener);

        let countyID = (new URL(document.location)).searchParams.get('lanid');
        if(!countyID){
            // Sets default value for town options, if there is no 'lanid' info in url.
            countyID = 10
        }
        newFetch.fetchList(`/platsannonser/soklista/kommuner?lanid=${countyID}`)
            .then(newDOM.displayFilterOptions);
    }
}

class Controller {
    addToUrl(newUrlEnding) {
        window.history.replaceState(null, null, newUrlEnding);
    }
    
    // Delays reloading needed for the application to work in Firefox and Safari
    delayReload() {
        setTimeout( () => {
          window.location.reload();
        }, 500);
    }
    
    formatDate(date) {
        let formatedDate = '';
        if (!date) {
            formatedDate = 'Öppen';
        } else {
            formatedDate = date.substring(0, 10);
        }
        return formatedDate;
    }
    
    checkUrlEnding() {
        // Separates url from query parameters
        const urlSeparator = '?';

        if (url.includes('annonsid')) {
            let jobId = (new URL(document.location)).searchParams.get('annonsid');

            newFetch.fetchList(`/platsannonser/${jobId}`)
                .then(newDOM.displaySingleJobPost);
        } else if (url.includes(urlSeparator)) {
            const firstIndexOfUrlEnding = url.indexOf(urlSeparator);
            const lastIndexOfUrlEnding = url.length;
            const urlEnding = url.substring(firstIndexOfUrlEnding, lastIndexOfUrlEnding);

            newController.addToUrl(urlEnding);
            newFetch.fetchList(`/platsannonser/matchning${urlEnding}`)
                .then(newDOM.displayListed);
        } else {
            //If entering the page with index.html only. Add Stockholm fetch info to url.
            location.replace(url + `?sida=1&antalrader=10&lanid=1`);
        }
    }

    filterElements() {
        const filterProfession = document.getElementById('filterProfession');
        const filterTown = document.getElementById('filterTown')
        const filterCounty = document.getElementById('filterCounty');
        const filterJobsByAmount = document.getElementById('filterJobsByAmount');
        const filterButton = document.getElementById('filterButton');
    }

    filterByOptions() {
        this.filterElements();
        filterButton.addEventListener('click', () => {
            newController.delayReload();
            if (Number(filterTown.value) > 0) {
                newController.addToUrl(`?sida=1&antalrader=${filterJobsByAmount.value}&lanid=${filterCounty.value}&yrkesomradeid=${filterProfession.value}&kommunid=${filterTown.value}`);
            } else {
                newController.addToUrl(`?sida=1&antalrader=${filterJobsByAmount.value}&lanid=${filterCounty.value}&yrkesomradeid=${filterProfession.value}`);
            }
        });
    }

    searchFieldElements() {
        const searchFieldInput = document.getElementById('searchFieldInput');
        const searchFieldButton = document.getElementById('searchFieldButton');
        const autoCompleteOutput = document.getElementById('autoCompleteOutput');
    }

    searchFieldEventlisteners() {
        this.searchFieldElements();

        searchFieldInput.addEventListener('keyup', () => {
            if (searchFieldInput.value.length < 3) {
                autoCompleteOutput.innerHTML = '<p id="autoCompleteMessage">Skriv 3 tecken för att få upp sökförslag</p>';
            } else if (searchFieldInput.value.length === 3) {
                autoCompleteOutput.innerHTML = '';
                newFetch.fetchList(`/platsannonser/soklista/yrken/${searchFieldInput.value}`)
                    .then(newDOM.displayAutoComplete);
            }
        });
        
        searchFieldButton.addEventListener('click', () => {
            if(searchFieldInput.value){
                newController.delayReload();
                newController.addToUrl(`?sida=1&antalrader=10&nyckelord=${searchFieldInput.value}`)
            }
        })  
        
        searchFieldInput.addEventListener('keydown', (event) => {
            if (event.keyCode === 13) {
                event.preventDefault(); 
                if (searchFieldInput.value.length > 2) {
                    /* Enables enter but still need the preventDefault to prevent
                       user from sending bad values in to the url */
                    newController.delayReload();
                    newController.addToUrl(`?sida=1&antalrader=10&nyckelord=${searchFieldInput.value}`)
                }  
            }
        })   
    }

    autoCompleteSearch() {
        const searchListItems = document.getElementsByClassName('searchDraft');

		for (let suggestedItem of searchListItems) {
			suggestedItem.addEventListener('click', function () {
				autoCompleteOutput.innerHTML = '';
                newController.delayReload();
                newController.addToUrl(`?sida=1&antalrader=10&nyckelord=${this.id}`);
            });
        }
        document.addEventListener('click', () => {
            //Closes the autoCompleteDiv if user clicks outside the div.
            autoCompleteOutput.innerHTML = '';
        });
    }

    paginationButtons(totalPageNumbers) {
        const currentPageNumber = (new URL(document.location)).searchParams.get('sida');
        const firstIndexOfUrlEnding = url.indexOf('antalrader') + 11;
        const lastIndexOfUrlEnding = url.length;
        const urlEnding = url.substring(firstIndexOfUrlEnding, lastIndexOfUrlEnding);

        const previousPageButton = document.getElementById('previousPage');
        const nextPageButton = document.getElementById('nextPage');

        previousPageButton.addEventListener('click', () => {
            if (Number(currentPageNumber) >= 2) {
                let prevPageNumber = Number(currentPageNumber)-1;
                newController.delayReload();
                newController.addToUrl(`?sida=${prevPageNumber}&antalrader=${urlEnding}`);
            }
        });
        nextPageButton.addEventListener('click', () => {
            if (Number(currentPageNumber) < totalPageNumbers) {
                let nextPageNumber = Number(currentPageNumber)+1;
                newController.delayReload();
                newController.addToUrl(`?sida=${nextPageNumber}&antalrader=${urlEnding}`);
            }
        });
    }

    closePopup() {
        window.onclick = (event) => {
            if (event.target === savedJobsPopupBackground || event.target === sharePopupBackground || event.target === errorMessagePopupBackground) {
                savedJobsPopupBackground.style.display = 'none';
                sharePopupBackground.style.display = 'none';
                errorMessagePopupBackground.style.display = 'none';
            }
        }
    }
    
    shareSearchResult() {
        const shareSearchResultButton = document.getElementById('shareSearchResultButton');
        shareSearchResultButton.addEventListener('click', newDOM.displayUrl);
    }

	savedAdsButtonEventlistener() {
		const displaySavedAdsButton = document.getElementById('savedAds');
        
        displaySavedAdsButton.addEventListener('click', () => {
			let savedAds = JSON.parse(localStorage.getItem('savedJobsList'));
            newFetch.fetchSavedAds(savedAds);
            outputSavedJobs.style.display = 'block';
            const savedJobsPopupBackground = document.getElementById('savedJobsPopupBackground');
            savedJobsPopupBackground.style.display = 'flex';
            
            newController.closePopup();
		});
	}
    
    clearLocalStorageButtonEventlistener() {
        document.addEventListener('click', (event) => {
            let clickedElem = event.target;
            
            if (clickedElem.id !== 'clearButton') {
                return;
            } else {
                localStorage.removeItem('savedJobsList');
                let outputSavedJobs = document.getElementById('outputSavedJobs');
                outputSavedJobs.innerText = 'Annonserna är borttagna!';
            }
        }, false);
    } 
    
    countyDropdownEventlistener() {   
        const filterTown = document.getElementById('filterTown');
        const filterCounty = document.getElementById('filterCounty');
        filterCounty.addEventListener('change', () => {
            newFetch.fetchList(`/platsannonser/soklista/kommuner?lanid=${filterCounty.value}`)
                .then(newDOM.displayFilterOptions)
        });
    }
    
    showSingleJobEventListener() {
        const outputListJobs = document.getElementById('outputListJobs');
        let countyID = (new URL(document.location)).searchParams.get('lanid');
        outputListJobs.addEventListener('click', (event) => {
            let clickedElem = event.target;

            if (clickedElem.className !== 'readMoreButton') {
                return;
            } else {
                newController.delayReload();
                newController.addToUrl(`?annonsid=${clickedElem.id}&lanid=${countyID}`);
            }
        }, false);
    }
    
    singleJobEventlistners() {
        const backButton = document.getElementById('backButton');
        const saveAdButton = document.getElementById('saveAdButton');
        
		backButton.addEventListener('click', () => {
            const previousUrl = localStorage.getItem('previousUrl');
            document.location.assign(previousUrl);
            localStorage.removeItem('previousUrl');
        });
        saveAdButton.addEventListener('click', function() {
            newSave.saveAdToBrowser(this.dataset.id);
            newDOM.displaySaveMessage();
        });
    }




	closeErrorMessage() {
        const outputErrorMessage = document.getElementById('outputErrorMessage');

        outputErrorMessage.addEventListener('click', (event) => {
            let clickedElem = event.target;
            
            if (clickedElem.id !== 'close') {
                return;
            } else {
                
               if (clickedElem.id === 'close'){
                   outputErrorMessage.style.display = 'none';
               }
                
            }
        }, false);
        
     }
}

class Save {
    saveAdToBrowser(id) {
        let savedJobId = JSON.parse(localStorage.getItem('savedJobsList'));

        if (savedJobId === null) {
            let jobIdArray = [];
            jobIdArray.push(id);
            localStorage.setItem('savedJobsList', JSON.stringify(jobIdArray));
        } else {
            if (!savedJobId.includes(id)) {
                savedJobId.push(id);
                localStorage.setItem('savedJobsList', JSON.stringify(savedJobId));
            }
        }
    }
}

class Fetch {
	fetchList(urlEnding) {
		return fetch(`http://api.arbetsformedlingen.se/af/v0${urlEnding}`)
			.then((response) => response.json())
			.then((result) => {
				const fetchResult = result;
				return fetchResult;
			})
            .catch((error) => {
				newDOM.displayErrorMessage(error);
			});
	}

	fetchSavedAds(saveAds) {
        if (saveAds != null) {		
            let jobArray = [];
            for (let adUrl of saveAds) {
                fetch(`http://api.arbetsformedlingen.se/af/v0/platsannonser/${adUrl}`)
                .then((response) => {
                    return response.json();
                })
                .then((job) => {
                    jobArray.push(job);
                    newDOM.displaySavedAds(jobArray)
                })
                .catch((error) => {
                    newDOM.displayError404Message(error);
                });
            }
        }
    }
}

class DOM {
    displayAmountOfJobs(latestJobs) {
        const amountOfJobsDiv = document.getElementById('amountOfJobs');
        const county = latestJobs.matchningslista.matchningdata[0].lan;
        const town = latestJobs.matchningslista.matchningdata[0].kommunnamn;
        const amountOfJobs = latestJobs.matchningslista.antal_platsannonser;
        
        let resultMessage = 'matchade jobb';
        if (url.includes('kommunid')) {
            resultMessage = `jobb i ${town}, ${county}`
        } else if (!url.includes('nyckelord')) {
            resultMessage = `jobb i ${county}`;
        }
        const amountOfJobsContent = `<p> Antal ${resultMessage}: ${amountOfJobs}`;
        amountOfJobsDiv.innerHTML = amountOfJobsContent;
    }

    displayFilterOptions(optionsValue) {
        let optionOutput = '';
        let optionsToList = optionsValue.soklista.listnamn;
        let options = '';

        for (let option of optionsValue.soklista.sokdata) {
            const optionID = option.id;
            const optionName = option.namn;

            options += `<option class="townItem" value="${optionID}">${optionName}</option>`;
        }

        if (optionsToList === 'yrkesomraden') {
            optionOutput = document.getElementById('filterProfession');
            optionOutput.innerHTML = options; 
        } else if (optionsToList === 'lan') {
            optionOutput = document.getElementById('filterCounty');
            optionOutput.innerHTML = options; 
            const townButton = document.getElementsByClassName('townItem');
            let countyID = (new URL(document.location)).searchParams.get('lanid'); 
            for (let i = 0; i < townButton.length; i++) {
                if (townButton[i].value === countyID) {
                    townButton[i].setAttribute('selected', 'selected')
                }
            } 
        } else {
            optionOutput = document.getElementById('filterTown');
            optionOutput.innerHTML = '<option class="townItem" value="0">Hela länet</option>' + options;
        }
    }

    displayAutoComplete(autoCompleteWords) {

        const autoCompleteUl = document.createElement('ul');
        const autoCompleteOutput = document.getElementById('autoCompleteOutput');
        autoCompleteOutput.appendChild(autoCompleteUl);
        let searchDrafts = '';

        if (autoCompleteWords.soklista.totalt_antal_platsannonser === 0) {
            let autoCompleteMessage = `<p id="autoCompleteMessage">Inget matchade din sökning, testa igen!</p>`;
            autoCompleteOutput.innerHTML = autoCompleteMessage;
        } else {
            for (let suggested of autoCompleteWords.soklista.sokdata) {
                if (suggested.antal_platsannonser > 0) {
                    searchDrafts += `
                        <li class="searchDraft" id="${suggested.namn}">
                            ${suggested.namn} 
                            <span>(${suggested.antal_platsannonser})</span>
                        </li>
                    `;
                }
            }
            autoCompleteUl.innerHTML = searchDrafts;
            newController.autoCompleteSearch();
        }
    }

    displayListed(latestJobs) {

        const outputListJobs = document.getElementById('outputListJobs');

        if (latestJobs.matchningslista.antal_platsannonser) {

            newDOM.displayAmountOfJobs(latestJobs);

            const jobData = latestJobs.matchningslista.matchningdata;
            let listedJobs = '';
            outputListJobs.innerHTML = '';
            const jobDataLength = jobData.length;

            for (let i = 0; i < jobDataLength; i++) {

                const date = jobData[i].sista_ansokningsdag;
                let formatedDate = newController.formatDate(date);

                const latestJob = document.createElement('div');
                latestJob.classList.add('latestJobs');
                latestJob.innerHTML = `
                    <h3>${jobData[i].annonsrubrik}</h3>
                    <p><span>${jobData[i].yrkesbenamning}</span> - ${jobData[i].kommunnamn}</p>
                    <p>${jobData[i].arbetsplatsnamn}</p>
                    <p>${jobData[i].anstallningstyp}</p>
                    <p><span>Sista ansökningsdag:</span> ${formatedDate}</p>
                    <button type="button" class="readMoreButton" id="${jobData[i].annonsid}">Läs mer!</button>
                `;
                outputListJobs.appendChild(latestJob);
            }
            
            newController.showSingleJobEventListener();    
            newDOM.pagination(latestJobs);
            localStorage.setItem('previousUrl', window.location.href);
        } else {
            outputListJobs.innerHTML = 'Inga matchade jobb';
        }
    }

	displaySavedAds(jobArray) {
        
		const outputSavedJobs = document.getElementById('outputSavedJobs');
		outputSavedJobs.innerHTML = '';
		const savedAdsList = document.createElement('ul');
		const jobDataLength = jobArray.length;

        outputSavedJobs.innerHTML = `<h2>Sparade jobbannonser</h2>`;

		for (let i = 0; i < jobDataLength; i++) {
			const listElement = document.createElement('li');
			let saveAd = jobArray[i].platsannons.annons;

			listElement.innerHTML = `${saveAd.annonsrubrik}<button id='savedAd${saveAd.annonsid}'>Läs mer!</button>`;

			savedAdsList.appendChild(listElement);
			outputSavedJobs.appendChild(savedAdsList);

			let savedAdButton = document.getElementById(`savedAd${saveAd.annonsid}`);
			savedAdButton.addEventListener('click', () => {
                newController.delayReload();
                newController.addToUrl(`?annonsid=${saveAd.annonsid}`);
			});
		}
        
        let clearSavedAdsButton = document.createElement('button');
        clearSavedAdsButton.setAttribute('id', 'clearButton');
        let textnode = document.createTextNode('Ta bort mina sparade annonser'); 
        clearSavedAdsButton.appendChild(textnode); 
        
        outputSavedJobs.appendChild(clearSavedAdsButton);
        newController.clearLocalStorageButtonEventlistener(clearSavedAdsButton); 
	}

    pagination(latestJobs) {    
        const currentPageNumber = (new URL(document.location)).searchParams.get('sida');
        const pageNumberDiv = document.getElementById('pageNumber');
        const totalAmountOfPages = latestJobs.matchningslista.antal_sidor;
        
        pageNumberDiv.innerHTML = `${currentPageNumber} av ${latestJobs.matchningslista.antal_sidor}`;
        newController.paginationButtons(totalAmountOfPages);     
    }

    displaySingleJobPost(jobDetails) {
        let pagineringWrapper = document.getElementById('pagineringWrapper');
        pagineringWrapper.style.visibility = 'hidden';
        const singleJobDetails = jobDetails.platsannons.annons;
        const applicationDetails = jobDetails.platsannons.ansokan;
        const workplaceDetails = jobDetails.platsannons.arbetsplats;
        const employmentConditions = jobDetails.platsannons.villkor;
        
        const date = applicationDetails.sista_ansokningsdag;
        let formatedDate = newController.formatDate(date);
        
        const jobId = jobDetails.platsannons.annons.annonsid;
        outputListJobs.innerHTML = `
            <div class="jobDetails">
                <button id="backButton">Tillbaka</button>
                <button id='saveAdButton' data-id='${jobId}'>Spara</button>
                <span id="saveMessage" class="hidden saveMessage"><i class="fas fa-check-circle"></i> Sparat</span>
                <h2>${singleJobDetails.annonsrubrik}</h2>
                <p><strong>${singleJobDetails.yrkesbenamning}</strong> - ${singleJobDetails.kommunnamn}</p>
                <p><strong>Antal platser:</strong> ${singleJobDetails.antal_platser} </p>
                <p class="singleJobText">${singleJobDetails.annonstext}</p>
                <p>${workplaceDetails.arbetsplatsnamn}</p>
                <h3>Villkor</h3>
                <p><strong>Anställningsform:</strong> ${employmentConditions.arbetstid}</p>
                <p><strong>Lön:</strong> ${employmentConditions.lonetyp}</p>
                <h3>Ansökan</h3>
                <p><strong>Sista ansökningsdag:</strong> ${formatedDate}</p>
                <p><a href="${applicationDetails.webbplats}">Ansök här</a></p>
            </div>
        `;
        newController.singleJobEventlistners();
    }

    displayUrl() {
        const outputShareSearchResult = document.getElementById('outputShareSearchResult');
        const sharePopupBackground = document.getElementById('sharePopupBackground');
        
        outputShareSearchResult.value = url;
        sharePopupBackground.style.display = 'flex';
        outputShareSearchResult.style.display = 'block';
        
        newController.closePopup();
    }
    
    displayErrorMessage(error) {
        const outputErrorMessage = document.getElementById('outputErrorMessage');
        const errorMessagePopupBackground = document.getElementById('errorMessagePopupBackground')
        outputErrorMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Hoppsan! Något gick fel</h3>
            <p>Det verkar som vi inte får kontakt med servern. Testa att ladda om sidan.</p>
            <div id="close">&times</div>
        `;
        errorMessagePopupBackground.style.display = 'flex';
        outputErrorMessage.style.display = 'block';

        newController.closePopup();
    }
    
    displayError404Message(error) {
        const outputErrorMessage = document.getElementById('outputErrorMessage');
        const errorMessagePopupBackground = document.getElementById('errorMessagePopupBackground')
        outputErrorMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Hoppsan! Någon annons har tagits bort av arbetsgivaren</h3>
            <div id="close">&times</div>
        `;
        errorMessagePopupBackground.style.display = 'flex';
        outputErrorMessage.style.display = 'block';

        newController.closePopup();
    }
    
    displaySaveMessage() {
        const saveMessage = document.getElementById('saveMessage');
        saveMessage.style.display = 'inline-block';
    }
}

const url = window.location.href;
const newDOM = new DOM;
const newSave = new Save;
const newController = new Controller;
const newFetch = new Fetch;

//Starts fetch when entering the homepage
const newInit = new Init;
newInit.launch();
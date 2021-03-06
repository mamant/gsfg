'use strict';

(function() {
  const form = document.querySelector('[data-get-users]');
  let matchBtn = document.querySelector('[data-get-starred-btn]');
  const gitHubUsersAPI = 'https://api.github.com/users/';
  let savedUsers = JSON.parse(localStorage.getItem('usersCollection')) || [];
  let usersURls = [];
  let usersCollection = [];

  form.addEventListener("submit", getStarred.bind(this));
  matchBtn.addEventListener('click', getStarredFromUsers);
  document.querySelector('[data-add-user]').addEventListener('click', addUserToList);
  document.querySelector('[data-clear]').addEventListener('click', clearData);

  document.querySelector('[data-results-placeholder]').innerHTML = '';
  document.querySelector('[data-results-matched-placeholder]').innerHTML = '';

  class gitHubUser {
    constructor(user) {
      this.name = user.name || 'User';
      this.login = user.login;
      this.avatar = user.avatar_url || user.avatar;
      this.starredURL = `${user.url}/starred?per_page=100`
      this.starredRepositories = user.starredRepositories || [];
    }

    getInfo() {
      console.log(
        this.name,
        this.starredURL,
        this.starredRepositories
      );
    }

    print() {
      var userElement = document.createElement('div');
      let userElementContent = `
        <div class="sg-media">
          <div class="sg-media__aside">
              <div class="sg-avatar"><img class="sg-avatar__image" src="${this.avatar}"></div>
          </div>
          <div class="sg-media__wrapper">
            <div class="sg-media__content">
              <span class="sg-link sg-link--gray sg-link--emphasised">${this.name}</span>
            </div>
            <div class="sg-media__content">
              <span>${this.name} has ${this.starredRepositories.length} starred repos</span>
            </div>
          </div>
        </div>
        <div class="sg-horizontal-separator sg-horizontal-separator--short-spaced"></div>`;
        userElement.innerHTML = userElementContent;
        document.querySelector('[data-results-placeholder]').appendChild(userElement);
    }

    save() {
      let savedUser = {
        name: this.name,
        avatar: this.avatar,
        starredRepositories: this.starredRepositories
      };
      usersCollection[usersCollection.length++] = savedUser;
      localStorage.setItem('usersCollection', JSON.stringify(usersCollection));
    }
  }

  if (savedUsers.length > 0 ) {
    savedUsers.forEach( user => {
      let sevedUser = new gitHubUser(user);
      sevedUser.print();
    });
  }

  function clearData() {
    usersURls = [];
    usersCollection = [];
    localStorage.removeItem('usersCollection');
    document.querySelector('[data-results-placeholder]').innerHTML = '';
    document.querySelector('[data-results-matched-placeholder]').innerHTML = '';
    }

  function addUserToList() {
    var newUserField = document.createElement('div');
    let newUserFieldContent = `<input type="text" data-user-input class="sg-input sg-input--spaced-bottom sg-input--full-width" required placeholder="user login">`;

    newUserField.innerHTML = newUserFieldContent;
    document.querySelector('[data-users-fields]').appendChild(newUserField);
  }

  function showLoading() {
    var loadingEl = document.createElement('div');
    let loadingElContent = `<div class="sg-getting-users">Getting users ..</div>`;

    loadingEl.innerHTML = loadingElContent;
    document.querySelector('[data-form]').appendChild(loadingEl);
  }

  function stopLoading() {
    document.querySelector('.sg-getting-users').remove();
  }

  function status(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(new Error(response.statusText))
    }
  }

  function json(response) {
    return response.json()
  }

  function getStarred(el) {
    clearData();
    showLoading();
    let starred = new Promise((resolve, reject) => {
      let usersList = el.currentTarget.querySelectorAll('[data-user-input]')
        usersList.forEach(function(item, i) {
          usersURls.push(gitHubUsersAPI + item.value );
        });
      resolve(usersURls);
    });

      starred.then( function (usersURls) {
        Promise.all(
            usersURls.map(url => fetch(url).then(resp => resp.json())
          )).then(data => {
            data.forEach(function(user, i) {
              let newUser = new gitHubUser(user);
              fetch(newUser.starredURL)
                .then(status)
                .then(json)
                .then(
                  data => {
                    newUser.starredRepositories = data;
                    newUser.save();
                    newUser.print();
                    stopLoading();
                  }
                );
            });
          });
      });

      starred.catch(function(error) {
        console.log('Request failed', error);
      });
  }

  function getStarredFromUsers() {
    document.querySelector('[data-results-matched-placeholder]').innerHTML = '';
    let savedUsers = JSON.parse(localStorage.getItem('usersCollection')) || [];
    let starresReposList = savedUsers.map( user => {
      return user.starredRepositories.map( repo => {
        return repo.full_name;
      })
    });

    let matched = starresReposList.shift().filter(function(v) {
      return starresReposList.every(function(a) {
          return a.indexOf(v) !== -1;
      });
    });

    if (matched.length > 0) {
      matched.forEach( repo => {
        var repoElement = document.createElement('div');
        let repoElementContent = `
          <div class="sg-media sg-media--focused">
            <div class="sg-media__wrapper">
              <div class="sg-media__content">
                <span class="sg-link sg-link--gray sg-link--emphasised">${repo}</span>
              </div>
            </div>
          </div>
          <div class="sg-horizontal-separator sg-horizontal-separator--short-spaced"></div>`;
          repoElement.innerHTML = repoElementContent;
          document.querySelector('[data-results-matched-placeholder]').appendChild(repoElement);
      });
    } else {
      document.querySelector('[data-results-matched-placeholder]').innerHTML = '<div class="sg-box">No matched repos</div>';
    }
  }
})();

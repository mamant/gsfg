describe('App in browser', function() {
  this.retries(2);

  beforeEach(function () {
    browser.get('http://localhost:3000');
  });

  it('should be shown', function () {
    expect($('[data-get-users]').isDisplayed()).to.eventually.be.true;
  });
});

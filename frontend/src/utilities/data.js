/** Utilities for modeling data immutably. */


/** A base class for representing data. */
class Data {
  /**
   * Create an instance of this class from an object.
   *
   * @param {Object} obj - An object containing information for
   *   instantiating the class.
   *
   * @return {Data} An instance of the class instantiated from obj.
   */
  static fromObject(obj) {
    throw new Error('Not implemented.');
  }

  /**
   * Return the instance serialized into an object.
   *
   * @return {Object} This instance serialized as an object.
   */
  toObject() {
    throw new Error('Not implemented.');
  }

  /**
   * Return an instance of the class created from the JSON data.
   *
   * @param {String} jsonString - A JSON string from which to create the
   *   instance.
   *
   * @return {Data} An instance of the class instantiated from
   *   jsonString.
   */
  static fromJSON(jsonString) {
    return this.fromObject(JSON.parse(jsonString));
  }

  /**
   * Return the instance serialized as a JSON string.
   *
   * @return {String} The instance serialized as a JSON string.
   */
  toJSON() {
    return JSON.stringify(this.toObject());
  }

  /**
   * Return a copy of this instance, updating attributes with data.
   *
   * @param {Object} data - An object containing key-value pairs to
   *   update in the newly returned instance.
   *
   * @return {Data} A copy of this instance with the attributes defined
   *   in data overriden.
   */
  copy(data) {
    return Object.assign(new this.constructor, this, data);
  }
}


export default Data;

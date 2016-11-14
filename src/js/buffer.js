/*
* SoundTouch JS audio processing library
* Copyright (c) Olli Parviainen
* Copyright (c) Ryan Berdeen
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU Lesser General Public
* License as published by the Free Software Foundation; either
* version 2.1 of the License, or (at your option) any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
* Lesser General License for more details.
*
* You should have received a copy of the GNU Lesser General Public
* License along with this library; if not, write to the Free Software
* Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/

function FifoSampleBuffer() {
    this._vector = new Float32Array();
    this._position = 0;
    this._frameCount = 0;
}

FifoSampleBuffer.prototype = {
    get vector() {
        return this._vector;
    },

    get position() {
        return this._position;
    },

    get startIndex() {
        return this._position * 2;
    },

    get frameCount() {
        return this._frameCount;
    },

    get endIndex() {
        return (this._position + this._frameCount) * 2;
    },

    clear: function() {
        this.receive();
        this.rewind();
    },

    put: function (numFrames) {
        this._frameCount += numFrames;
    },

    putSamples: function (samples, position, numFrames) {
        position = position || 0;
        var sourceOffset = position * 2;
        if (!(numFrames >= 0)) {
            numFrames = (samples.length - sourceOffset) / 2;
        }
        var numSamples = numFrames * 2;

        this.ensureCapacity(numFrames + this._frameCount);

        var destOffset = this.endIndex;
        this._vector.set(samples.subarray(sourceOffset, sourceOffset + numSamples), destOffset);

        this._frameCount += numFrames;
    },

    putBuffer: function (buffer, position, numFrames) {
        position = position || 0;
        if (!(numFrames >= 0)) {
            numFrames = buffer.frameCount - position;
        }
        this.putSamples(buffer.vector, buffer.position + position, numFrames);
    },

    receive: function (numFrames) {
        if (!(numFrames >= 0) || numFrames > this._frameCount) {
            numFrames = this._frameCount
        }
        this._frameCount -= numFrames;
        this._position += numFrames;
    },

    receiveSamples: function (output, numFrames) {
        var numSamples = numFrames * 2;
        var sourceOffset = this.startIndex;
        output.set(this._vector.subarray(sourceOffset, sourceOffset + numSamples));
        this.receive(numFrames);
    },

    extract: function (output, position, numFrames) {
        var sourceOffset = this.startIndex + position * 2;
        var numSamples = numFrames * 2;
        output.set(this._vector.subarray(sourceOffset, sourceOffset + numSamples));
    },

    ensureCapacity: function (numFrames) {
        var minLength = numFrames * 2;
        if (this._vector.length < minLength) {
            var newVector = new Float32Array(minLength);
            newVector.set(this._vector.subarray(this.startIndex, this.endIndex));
            this._vector = newVector;
            this._position = 0;
        }
        else {
            this.rewind();
        }
    },

    ensureAdditionalCapacity: function (numFrames) {
        this.ensureCapacity(this.frameCount + numFrames);
    },

    rewind: function () {
        if (this._position > 0) {
            this._vector.set(this._vector.subarray(this.startIndex, this.endIndex));
            this._position = 0;
        }
    }
};

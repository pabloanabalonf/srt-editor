var array = [
	{
		name: 'China',
		hablar: function (){
			console.log(this.name+ ' lalala');
		}
	},
	{
		name: 'Pablo',
		hablar: function (){
			console.log(this.name+ ' lalala');
		}
	},
	{
		name: 'Dani',
		hablar: function (){
			console.log(this.name+ ' lalala');
		}
	},
];

for(var i = 0; i < array.length; i++){
	array[i].hablar();
}
console.log('-------');
for(var x in array[1]){
	console.log(x);
}
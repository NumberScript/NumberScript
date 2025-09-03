# NumberScript grammar for nearley parser
Expression -> Expression _ ("+" | "-") _ Term
           {% function(d){ return {type:'binary', op:d[2], left:d[0], right:d[4]}; } %}
          | Term

Term -> Term _ ("*" | "/") _ Factor
      {% function(d){ return {type:'binary', op:d[2], left:d[0], right:d[4]}; } %}
     | Factor

Factor -> Factor _ "^" _ Atom
        {% function(d){ return {type:'binary', op:'^', left:d[0], right:d[4]}; } %}
       | Atom

Atom -> Number
        {% id %}
     | Identifier LParen ArgList RParen
        {% function(d){ return {type:'call', name:d[0].value, args:d[2]}; } %}
     | Identifier
        {% function(d){ return {type:'var', name:d[0].value}; } %}
     | LParen _ Expression _ RParen
        {% function(d){ return d[2]; } %}

ArgList -> _ {% function(d){ return []; } %}
         | _ Expression ( _ "," _ Expression )*
           {% function(d){ return [d[1]].concat(d[4].map(x=>x[3])); } %}

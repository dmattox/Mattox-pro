'use strict';

function basicTopology() {
    theNetwork.addSwitch(0, 1*2, 2*2);
    theNetwork.addSwitch(1, 1*2, 1*2);
    theNetwork.addSwitch(2, 2*2, 2*2);
    theNetwork.addSwitch(3, 1*2, 3*2);
    theNetwork.addSwitch(4, 3*2, 3*2);
    theNetwork.addSwitch(5, 3*2, 4*2);
    theNetwork.addSwitch(6, 4*2, 4*2);
    theNetwork.addSwitch(7, 5*2, 3*2);
    theNetwork.addSwitch(8, 4*2, 2*2);
    theNetwork.addSwitch(9, 3*2, 1*2);
    theNetwork.addSwitch(10, 4*2, 1*2);

    theNetwork.addLink(0, 1);
    theNetwork.addLink(1, 2);
    theNetwork.addLink(2, 0);
    theNetwork.addLink(3, 0);
    theNetwork.addLink(4, 2);
    theNetwork.addLink(4, 5);
    theNetwork.addLink(5, 6);
    theNetwork.addLink(6, 7);
    theNetwork.addLink(7, 8);
    theNetwork.addLink(8, 4);
    theNetwork.addLink(9, 2);
    theNetwork.addLink(10, 9);
    theNetwork.addLink(8, 10);

    cy.layout({
        name: 'preset'
    });

    cy.reset();
    cy.fit();
}

function complexTopology() {
    theNetwork.addSwitch(6, 9, 1);
    theNetwork.addSwitch(7, 9, 2);
    theNetwork.addSwitch(8, 9, 3);
    theNetwork.addSwitch(9, 9, 5);
    theNetwork.addSwitch(10, 9, 6);
    theNetwork.addSwitch(11, 9, 7);
    theNetwork.addSwitch(4, 7, 2);
    theNetwork.addSwitch(5, 7, 6);
    theNetwork.addSwitch(2, 5, 2);
    theNetwork.addSwitch(3, 5, 6);
    theNetwork.addSwitch(1, 3, 4);
    theNetwork.addSwitch(12, 1, 4);

    theNetwork.addLink(12, 1);
    theNetwork.addLink(1, 2);
    theNetwork.addLink(1, 3);
    theNetwork.addLink(2, 4);
    theNetwork.addLink(4, 6);
    theNetwork.addLink(4, 7);
    theNetwork.addLink(4, 8);
    theNetwork.addLink(2, 3);
    theNetwork.addLink(4, 5);
    theNetwork.addLink(3, 5);
    theNetwork.addLink(5, 9);
    theNetwork.addLink(5, 10);
    theNetwork.addLink(5, 11);


    cy.layout({
        name: 'preset'
    });

    cy.reset();
    cy.fit();
}

function ringTopology() {
    theNetwork.addSwitch(10, 1*2, 1*2);
    theNetwork.addSwitch(11, 2*2, 1*2);
    theNetwork.addSwitch(12, 3*2, 1*2);
    theNetwork.addSwitch(13, 4*2, 1*2);
    theNetwork.addSwitch(14, 5*2, 1*2);
    theNetwork.addSwitch(15, 1*2, 2*2);
    theNetwork.addSwitch(16, 5*2, 2*2);
    theNetwork.addSwitch(17, 1*2, 3*2);
    theNetwork.addSwitch(18, 5*2, 3*2);
    theNetwork.addSwitch(19, 1*2, 4*2);
    theNetwork.addSwitch(20, 2*2, 4*2);
    theNetwork.addSwitch(21, 3*2, 4*2);
    theNetwork.addSwitch(22, 4*2, 4*2);
    theNetwork.addSwitch(23, 5*2, 4*2);
    theNetwork.addSwitch(50, 3*2, 2*2);
    theNetwork.addSwitch(51, 4*2, 2*2);
    theNetwork.addSwitch(52, 6*2, 2*2);
    theNetwork.addSwitch(53, 7*2, 2*2);
    theNetwork.addSwitch(54, 3*2, 3*2);
    theNetwork.addSwitch(55, 7*2, 3*2);
    theNetwork.addSwitch(56, 7*2, 4*2);
    theNetwork.addSwitch(57, 3*2, 5*2);
    theNetwork.addSwitch(58, 5*2, 5*2);
    theNetwork.addSwitch(59, 7*2, 5*2);
    theNetwork.addSwitch(99, 4*2, 3*2);
    
    theNetwork.addLink(10, 11);
    theNetwork.addLink(11, 12);
    theNetwork.addLink(12, 13);
    theNetwork.addLink(13, 14);
    theNetwork.addLink(14, 16);
    theNetwork.addLink(16, 18);
    theNetwork.addLink(18, 23);
    theNetwork.addLink(23, 22);
    theNetwork.addLink(21, 22);
    theNetwork.addLink(20, 19);
    theNetwork.addLink(20, 21);
    theNetwork.addLink(17, 15);
    theNetwork.addLink(19, 17);
    theNetwork.addLink(10, 15);
    theNetwork.addLink(50, 51);
    theNetwork.addLink(51, 16);
    theNetwork.addLink(16, 52);
    theNetwork.addLink(53, 52);
    theNetwork.addLink(53, 55);
    theNetwork.addLink(55, 56);
    theNetwork.addLink(56, 59);
    theNetwork.addLink(59, 58);
    theNetwork.addLink(57, 58);
    theNetwork.addLink(21, 57);
    theNetwork.addLink(54, 21);
    theNetwork.addLink(50, 54);
    theNetwork.addLink(51, 99);
    theNetwork.addLink(54, 99);
    theNetwork.addLink(18, 99);
    theNetwork.addLink(22, 99);
    

    cy.layout({
        name: 'preset'
    });

    cy.reset();
    cy.fit();
}

function butterflyTopology() {
    theNetwork.addSwitch(15, 3, 1);
    theNetwork.addSwitch(16, 5, 1);
    theNetwork.addSwitch(9,4, 3);
    theNetwork.addSwitch(8, 1, 4);
    theNetwork.addSwitch(2, 3, 4);
    theNetwork.addSwitch(3, 5, 4);
    theNetwork.addSwitch(10, 7, 4);
    theNetwork.addSwitch(4, 2, 5);
    theNetwork.addSwitch(1, 4, 5);
    theNetwork.addSwitch(5, 6, 5);
    theNetwork.addSwitch(13, 1, 6);
    theNetwork.addSwitch(6, 3, 6);
    theNetwork.addSwitch(7, 5, 6);
    theNetwork.addSwitch(11, 7, 6);
    theNetwork.addSwitch(14, 4, 7);
    theNetwork.addSwitch(17, 2, 3);
    theNetwork.addSwitch(18, 6, 3);
    theNetwork.addSwitch(19, 2, 7);
    theNetwork.addSwitch(20, 6, 7);

    theNetwork.addLink(15, 9);
    theNetwork.addLink(16, 9);
    theNetwork.addLink(2, 9);
    theNetwork.addLink(3, 9);
    theNetwork.addLink(2, 1);
    theNetwork.addLink(3, 1);
    theNetwork.addLink(1, 6);
    theNetwork.addLink(1, 7);
    theNetwork.addLink(2, 4);
    theNetwork.addLink(4, 6);
    theNetwork.addLink(2, 17);
    theNetwork.addLink(17, 8);
    theNetwork.addLink(8, 4);
    theNetwork.addLink(4, 13);
    theNetwork.addLink(13, 19);
    theNetwork.addLink(19, 6);
    theNetwork.addLink(6, 14);
    theNetwork.addLink(14, 7);
    theNetwork.addLink(7, 20);
    theNetwork.addLink(20, 11);
    theNetwork.addLink(11, 5);
    theNetwork.addLink(5, 7);
    theNetwork.addLink(5, 3);
    theNetwork.addLink(5, 10);
    theNetwork.addLink(10, 18);
    theNetwork.addLink(18,3);
    
    cy.reset();
    cy.fit();

}



function mazeTopology() {
    theNetwork.addSwitch(1, 1, 3);
    theNetwork.addSwitch(2, 5, 3);
    theNetwork.addSwitch(3, 5, 2);
    theNetwork.addSwitch(4, 6, 2);
    theNetwork.addSwitch(5, 6, 1);
    theNetwork.addSwitch(6, 5, 1);
    theNetwork.addSwitch(7, 4, 1);
    theNetwork.addSwitch(8, 4, 2);
    theNetwork.addSwitch(9, 4, 3);
    theNetwork.addSwitch(10, 4, 4);
    theNetwork.addSwitch(11, 3, 4);
    theNetwork.addSwitch(12, 3, 3);
    theNetwork.addSwitch(13, 2, 3);
    theNetwork.addSwitch(14, 6, 3);
    theNetwork.addSwitch(15, 4, 5);
    theNetwork.addSwitch(16, 3, 5);
    theNetwork.addSwitch(17, 2, 5);
    theNetwork.addSwitch(18, 2, 4);
    theNetwork.addSwitch(19, 1, 4);
    theNetwork.addSwitch(20, 1, 5);
    theNetwork.addSwitch(21, 5, 4);
    theNetwork.addSwitch(22, 6, 4);
    theNetwork.addSwitch(23, 6, 5);
    theNetwork.addSwitch(24, 6, 6);
    theNetwork.addSwitch(25, 5, 6);
    theNetwork.addSwitch(26, 4, 6);
    theNetwork.addSwitch(27, 3, 6);
    theNetwork.addSwitch(28, 2, 6);
    theNetwork.addSwitch(29, 1, 6);
    theNetwork.addSwitch(30, 1, 7);
    theNetwork.addSwitch(31, 1, 8);
    theNetwork.addSwitch(32, 2, 8);
    theNetwork.addSwitch(33, 3, 8);
    theNetwork.addSwitch(34, 4, 8);
    theNetwork.addSwitch(35, 2, 7);
    theNetwork.addSwitch(36, 3, 7);
    theNetwork.addSwitch(37, 4, 7);
    theNetwork.addSwitch(38, 5, 7);
    theNetwork.addSwitch(39, 6, 7);
    theNetwork.addSwitch(40, 7, 3);
    theNetwork.addSwitch(41, 7, 2);
    theNetwork.addSwitch(42, 7, 1);
    theNetwork.addSwitch(43, 8, 1);
    theNetwork.addSwitch(44, 7, 7);
    theNetwork.addSwitch(45, 7, 6);
    theNetwork.addSwitch(46, 7, 5);
    theNetwork.addSwitch(47, 7, 4);
    theNetwork.addSwitch(48, 8, 4);
    theNetwork.addSwitch(49, 5, 8);
    theNetwork.addSwitch(50, 6, 8);
    theNetwork.addSwitch(51, 7, 8);
    theNetwork.addSwitch(52, 8, 8);
    theNetwork.addSwitch(53, 8, 7);
    theNetwork.addSwitch(54, 8, 6);
    theNetwork.addSwitch(55, 8, 5);
    theNetwork.addSwitch(56, 9, 7);
    theNetwork.addSwitch(57, 9, 8);
    theNetwork.addSwitch(58, 10, 8);
    theNetwork.addSwitch(59, 9, 5);
    theNetwork.addSwitch(60, 9, 4);
    theNetwork.addSwitch(61, 9, 3);
    theNetwork.addSwitch(62, 8, 2);
    theNetwork.addSwitch(63, 9, 2);
    theNetwork.addSwitch(64, 9, 1);
    theNetwork.addSwitch(65, 10, 1);
    theNetwork.addSwitch(66, 11, 1);
    theNetwork.addSwitch(67, 10, 3);
    theNetwork.addSwitch(68, 11, 3);
    theNetwork.addSwitch(69, 11, 2);
    theNetwork.addSwitch(70, 12, 2);
    theNetwork.addSwitch(71, 12, 3);
    theNetwork.addSwitch(72, 12, 4);
    theNetwork.addSwitch(73, 11, 4);
    theNetwork.addSwitch(74, 10, 4);
    theNetwork.addSwitch(75, 10, 5);
    theNetwork.addSwitch(76, 10, 6);
    theNetwork.addSwitch(77, 10, 7);
    theNetwork.addSwitch(78, 14, 2);
    theNetwork.addSwitch(79, 14, 3);
    theNetwork.addSwitch(80, 14, 4);
    theNetwork.addSwitch(81, 14, 5);
    theNetwork.addSwitch(82, 13, 5);
    theNetwork.addSwitch(83, 12, 5);
    theNetwork.addSwitch(84, 11, 5);
    theNetwork.addSwitch(85, 11, 6);
    theNetwork.addSwitch(86, 12, 6);
    theNetwork.addSwitch(87, 13, 6);
    theNetwork.addSwitch(88, 14, 6);
    theNetwork.addSwitch(89, 11, 7);
    theNetwork.addSwitch(90, 11, 8);
    theNetwork.addSwitch(91, 12, 8);
    theNetwork.addSwitch(92, 12, 7);
    theNetwork.addSwitch(93, 13, 7);
    theNetwork.addSwitch(94, 13, 8);
    theNetwork.addSwitch(95, 14, 7);
    theNetwork.addSwitch(96, 14, 8);
    theNetwork.addSwitch(97, 15, 6);
    theNetwork.addSwitch(98, 15, 7);
    theNetwork.addSwitch(99, 15, 8);
    theNetwork.addSwitch(100, 16, 7);
    theNetwork.addSwitch(101, 13, 4);
    theNetwork.addSwitch(102, 13, 3);
    theNetwork.addSwitch(103, 13, 2);
    theNetwork.addSwitch(104, 13, 1);
    theNetwork.addSwitch(105, 14, 1);

    theNetwork.addLink(2,3);
    theNetwork.addLink(82,81);
    theNetwork.addLink(4,5);
    theNetwork.addLink(8,7);
    theNetwork.addLink(13,1);
    theNetwork.addLink(14,2);
    theNetwork.addLink(15,10);
    theNetwork.addLink(18,17);
    theNetwork.addLink(20,19);
    theNetwork.addLink(21,10);
    theNetwork.addLink(22,21);
    theNetwork.addLink(24,23);
    theNetwork.addLink(29,20);
    theNetwork.addLink(32,31);
    theNetwork.addLink(33,32);
    theNetwork.addLink(34,33);
    theNetwork.addLink(35,28);
    theNetwork.addLink(37,36);
    theNetwork.addLink(38,37);
    theNetwork.addLink(40,14);
    theNetwork.addLink(43,42);
    theNetwork.addLink(44,39);
    theNetwork.addLink(48,47);
    theNetwork.addLink(49,34);
    theNetwork.addLink(50,49);
    theNetwork.addLink(51,50);
    theNetwork.addLink(54,55);
    theNetwork.addLink(56,53);
    theNetwork.addLink(57,56);
    theNetwork.addLink(58,57);
    theNetwork.addLink(59,55);
    theNetwork.addLink(62,43);
    theNetwork.addLink(63,62);
    theNetwork.addLink(64,63);
    theNetwork.addLink(65,64);
    theNetwork.addLink(66,65);
    theNetwork.addLink(67,61);
    theNetwork.addLink(68,67);
    theNetwork.addLink(69,66);
    theNetwork.addLink(70,69);
    theNetwork.addLink(71,70);
    theNetwork.addLink(74,73);
    theNetwork.addLink(75,76);
    theNetwork.addLink(76,77);
    theNetwork.addLink(77,89);
    theNetwork.addLink(78,105);
    theNetwork.addLink(79,78);
    theNetwork.addLink(80,79);
    theNetwork.addLink(81,80);
    theNetwork.addLink(82,83);
    theNetwork.addLink(84,83);
    theNetwork.addLink(87,86);
    theNetwork.addLink(88,87);
    theNetwork.addLink(90,58);
    theNetwork.addLink(91,90);
    theNetwork.addLink(94,91);
    theNetwork.addLink(96,94);
    theNetwork.addLink(98,97);
    theNetwork.addLink(99,96);
    theNetwork.addLink(100,98);
    theNetwork.addLink(101,72);
    theNetwork.addLink(102,101);
    theNetwork.addLink(103,102);
    theNetwork.addLink(104,103);
    theNetwork.addLink(105,104);
    theNetwork.addLink(3,4);
    theNetwork.addLink(6,5);
    theNetwork.addLink(7,6);
    theNetwork.addLink(8,9);
    theNetwork.addLink(9,10);
    theNetwork.addLink(12,11);
    theNetwork.addLink(10,11);
    theNetwork.addLink(13,12);
    theNetwork.addLink(15,16);
    theNetwork.addLink(17,16);
    theNetwork.addLink(18,19);
    theNetwork.addLink(22,23);
    theNetwork.addLink(25,24);
    theNetwork.addLink(26,25);
    theNetwork.addLink(27,26);
    theNetwork.addLink(28,27);
    theNetwork.addLink(29,30);
    theNetwork.addLink(30,31);
    theNetwork.addLink(35,36);
    theNetwork.addLink(39,38);
    theNetwork.addLink(40,41);
    theNetwork.addLink(42,41);
    theNetwork.addLink(45,44);
    theNetwork.addLink(46,45);
    theNetwork.addLink(47,46);
    theNetwork.addLink(52,51);
    theNetwork.addLink(54,53);
    theNetwork.addLink(59,60);
    theNetwork.addLink(60,48);
    theNetwork.addLink(72,71);
    theNetwork.addLink(73,68);
    theNetwork.addLink(74,75);
    theNetwork.addLink(85,84);
    theNetwork.addLink(86,85);
    theNetwork.addLink(88,97);
    theNetwork.addLink(89,92);
    theNetwork.addLink(92,93);
    theNetwork.addLink(93,95);
    theNetwork.addLink(98,95);
    theNetwork.addLink(99,98);
    theNetwork.addLink(53,52);
    theNetwork.addLink(60,61);
    
    theNetwork.displayPortText = false;

    cy.layout({
        name: 'preset'
    });

    cy.reset();
    cy.fit();
}